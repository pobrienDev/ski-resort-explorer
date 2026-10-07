from collections import OrderedDict
from flask import Flask, jsonify, request, Response
from flask_cors import CORS
import logging
import mysql.connector
import os
import requests
import time
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger(__name__)

app = Flask(__name__)

# In development the Vite dev server proxies /api to Flask, so the browser never
# makes a cross-origin request and no CORS headers are needed. Set CORS_ORIGINS
# (comma-separated) only when a separately hosted frontend calls this API directly.
cors_origins = [o.strip() for o in os.getenv("CORS_ORIGINS", "").split(",") if o.strip()]
if cors_origins:
    CORS(app, origins=cors_origins)

# Database Configuration
DB_CONFIG = {
    "host": os.getenv("DB_HOST", "localhost"),
    "user": os.getenv("DB_USER", "root"),
    "password": os.getenv("DB_PASSWORD", ""),
    "database": os.getenv("DB_NAME", "SkiResorts"),
}

# OpenWeather Configuration. The key lives only on the server; the client
# talks to /api/weather and /api/weather/tiles, which forward requests upstream.
OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY", "")
OPENWEATHER_WEATHER_URL = "https://api.openweathermap.org/data/2.5/weather"
OPENWEATHER_TILE_URL = "https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png"
OPENWEATHER_TIMEOUT_SECONDS = 10

# Weather responses are cached in memory so repeat views, and the many tile
# requests a single radar pan produces, do not each cost an upstream call.
# OpenWeather refreshes roughly every 10 minutes, so that is the default TTL.
WEATHER_CACHE_SECONDS = int(os.getenv("WEATHER_CACHE_SECONDS", "600"))


class TTLCache:
    """A tiny in-process cache: entries expire after ttl seconds and the
    oldest entry is evicted once max_entries is exceeded. Per gunicorn
    worker, not shared, which is fine at this app's scale."""

    def __init__(self, ttl_seconds, max_entries, clock=time.monotonic):
        self.ttl = ttl_seconds
        self.max_entries = max_entries
        self.clock = clock
        self._entries = OrderedDict()

    def get(self, key):
        entry = self._entries.get(key)
        if entry is None:
            return None
        expires_at, value = entry
        if self.clock() >= expires_at:
            del self._entries[key]
            return None
        return value

    def set(self, key, value):
        self._entries[key] = (self.clock() + self.ttl, value)
        self._entries.move_to_end(key)
        while len(self._entries) > self.max_entries:
            self._entries.popitem(last=False)

    def __len__(self):
        return len(self._entries)


CONDITIONS_CACHE = TTLCache(WEATHER_CACHE_SECONDS, max_entries=256)
TILE_CACHE = TTLCache(WEATHER_CACHE_SECONDS, max_entries=1024)

def get_db_connection():
    """Establish and return a MySQL database connection."""
    try:
        return mysql.connector.connect(**DB_CONFIG)
    except mysql.connector.Error as err:
        log.error("Database connection failed: %s", err)
        return None

def fetch_resorts(query, params=None):
    """Execute a query and fetch resorts from the database."""
    conn = get_db_connection()
    if conn is None:
        return {"error": "Database connection failed"}

    cursor = None
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute(query, params or ())
        resorts = cursor.fetchall()
        
        # Handle empty result set gracefully
        if not resorts:
            return {"resorts": []}  # Ensure empty list if no resorts found

        return {"resorts": resorts}  # Return as a dict
    except mysql.connector.Error as err:
        # Log the real error server-side; never echo driver messages to clients.
        log.error("Database query failed: %s", err)
        return {"error": "Database query failed"}
    finally:
        if cursor is not None:
            cursor.close()
        conn.close()

def resorts_response(result):
    """Build a JSON response, using 500 when the fetch produced an error."""
    return jsonify(result), (500 if "error" in result else 200)

RESORT_SELECT = """
    SELECT DISTINCT sr.resortID, sr.resort_name, st.state_name, sr.summit, sr.base, sr.vertical,
           sr.lifts, sr.runs, sr.acres, sr.green_percent, sr.blue_percent, sr.black_percent,
           sr.double_black_percent, sr.lat, sr.lon, sr.url, sr.source_url, sr.verified_on
    FROM ski_resorts sr
    JOIN states_terr st ON sr.stateID = st.stateID
"""

def escape_like(text):
    """Escape LIKE wildcards so user input matches literally. Pair with ESCAPE '!'."""
    return text.replace("!", "!!").replace("%", "!%").replace("_", "!_")

@app.route("/api/resorts", methods=['GET'])
def get_resorts():
    """Fetch ski resorts, optionally filtered.

    Query parameters (both optional, combined with AND):
      q      case-insensitive substring match on resort name or location
      state  exact (case-insensitive) match on location, e.g. state=Colorado
    """
    conditions, params = [], []
    q = request.args.get("q", "").strip()
    if q:
        pattern = f"%{escape_like(q)}%"
        conditions.append("(sr.resort_name LIKE %s ESCAPE '!' OR st.state_name LIKE %s ESCAPE '!')")
        params.extend([pattern, pattern])
    state = request.args.get("state", "").strip()
    if state:
        conditions.append("st.state_name = %s")
        params.append(state)

    query = RESORT_SELECT
    if conditions:
        query += "    WHERE " + " AND ".join(conditions) + "\n"
    query += "    ORDER BY sr.resort_name;"
    result = fetch_resorts(query, tuple(params))
    return resorts_response(result)

@app.route("/api/resorts/<int:resort_id>", methods=['GET'])
def get_resort(resort_id):
    """Fetch a single ski resort by ID.

    The <int:> converter only matches non-negative integers, so malformed ids
    such as /api/resorts/abc or /api/resorts/-1 are rejected with a 404 before
    this handler runs. A well-formed id with no matching row also returns 404.
    """
    query = RESORT_SELECT + "    WHERE sr.resortID = %s;"
    result = fetch_resorts(query, (resort_id,))
    if "error" in result:
        return jsonify(result), 500
    resorts = result.get("resorts", [])
    if not resorts:
        return jsonify({"error": "Resort not found"}), 404
    return jsonify({"resort": resorts[0]}), 200

def weather_not_configured():
    """503 response used when OPENWEATHER_API_KEY is missing."""
    return jsonify({"error": "Weather service is not configured"}), 503

def fetch_openweather(url, params):
    """GET an OpenWeather URL with the server-side key. Returns the response or None on failure."""
    try:
        upstream = requests.get(
            url,
            params={**params, "appid": OPENWEATHER_API_KEY},
            timeout=OPENWEATHER_TIMEOUT_SECONDS,
        )
    except requests.RequestException as err:
        log.error("OpenWeather request failed: %s", err)
        return None
    if upstream.status_code != 200:
        # Log the real status (401 = bad key, 429 = quota) but never expose it to the browser.
        log.error("OpenWeather returned %s for %s", upstream.status_code, url)
        return None
    return upstream

@app.route("/api/weather", methods=['GET'])
def get_weather():
    """Proxy current conditions for a lat/lon so the OpenWeather key stays server-side."""
    if not OPENWEATHER_API_KEY:
        return weather_not_configured()
    try:
        lat = float(request.args["lat"])
        lon = float(request.args["lon"])
    except (KeyError, ValueError):
        return jsonify({"error": "lat and lon query parameters are required and must be numeric"}), 400
    if not (-90 <= lat <= 90 and -180 <= lon <= 180):
        return jsonify({"error": "lat/lon out of range"}), 400

    # Two decimals is about 1 km, so nearby requests share an entry.
    key = (round(lat, 2), round(lon, 2))
    cached = CONDITIONS_CACHE.get(key)
    if cached is not None:
        return jsonify(cached), 200, {"X-Cache": "HIT"}

    upstream = fetch_openweather(
        OPENWEATHER_WEATHER_URL,
        {"lat": lat, "lon": lon, "units": "imperial"},
    )
    if upstream is None:
        return jsonify({"error": "Weather service unavailable"}), 502
    payload = upstream.json()
    CONDITIONS_CACHE.set(key, payload)
    return jsonify(payload), 200, {"X-Cache": "MISS"}

@app.route("/api/weather/tiles/<int:z>/<int:x>/<int:y>.png", methods=['GET'])
def get_weather_tile(z, x, y):
    """Proxy OpenWeather precipitation radar tiles so the key never appears in tile URLs."""
    if not OPENWEATHER_API_KEY:
        return weather_not_configured()
    max_index = 2 ** z
    if z > 19 or x >= max_index or y >= max_index:
        return jsonify({"error": "Invalid tile coordinates"}), 400

    key = (z, x, y)
    png = TILE_CACHE.get(key)
    cache_state = "HIT"
    if png is None:
        upstream = fetch_openweather(OPENWEATHER_TILE_URL.format(z=z, x=x, y=y), {})
        if upstream is None:
            return jsonify({"error": "Weather service unavailable"}), 502
        png = upstream.content
        TILE_CACHE.set(key, png)
        cache_state = "MISS"
    return Response(
        png,
        status=200,
        content_type="image/png",
        headers={"Cache-Control": f"public, max-age={WEATHER_CACHE_SECONDS}", "X-Cache": cache_state},
    )

if __name__ == "__main__":
    app.run(debug=os.getenv("FLASK_DEBUG", "1") == "1", port=int(os.getenv("PORT", "8080")))
