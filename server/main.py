from flask import Flask, jsonify, request, Response
from flask_cors import CORS
import mysql.connector
import os
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app, origins='*')

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

def get_db_connection():
    """Establish and return a MySQL database connection."""
    try:
        return mysql.connector.connect(**DB_CONFIG)
    except mysql.connector.Error as err:
        print(f"[ERROR] Database connection failed: {err}")
        return None

def fetch_resorts(query, params=None):
    """Execute a query and fetch resorts from the database."""
    conn = get_db_connection()
    if conn is None:
        return {"error": "Database connection failed"}

    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute(query, params or ())
        resorts = cursor.fetchall()
        
        # Handle empty result set gracefully
        if not resorts:
            return {"resorts": []}  # Ensure empty list if no resorts found

        return {"resorts": resorts}  # Return as a dict
    except mysql.connector.Error as err:
        print(f"[ERROR] Database query failed: {err}")
        return {"error": "Database query failed", "details": str(err)}
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals():
            conn.close()

def resorts_response(result):
    """Build a JSON response, using 500 when the fetch produced an error."""
    return jsonify(result), (500 if "error" in result else 200)

@app.route("/api/resorts", methods=['GET'])
def get_resorts():
    """Fetch all ski resorts."""
    query = """
        SELECT DISTINCT sr.resortID, sr.resort_name, st.state_name, sr.summit, sr.base, sr.lifts,
               sr.runs, sr.green_percent, sr.blue_percent, sr.black_percent, sr.double_black_percent,
               sr.lat, sr.lon, sr.url
        FROM ski_resorts sr
        JOIN states_terr st ON sr.stateID = st.stateID;
    """
    result = fetch_resorts(query)
    return resorts_response(result)

@app.route("/api/resorts/<int:resort_id>", methods=['GET'])
def get_resort(resort_id):
    """Fetch a single ski resort by ID."""
    query = """
        SELECT DISTINCT sr.resortID, sr.resort_name, st.state_name, sr.summit, sr.base, sr.lifts,
               sr.runs, sr.green_percent, sr.blue_percent, sr.black_percent, sr.double_black_percent,
               sr.lat, sr.lon, sr.url
        FROM ski_resorts sr
        JOIN states_terr st ON sr.stateID = st.stateID
        WHERE sr.resortID = %s;
    """
    result = fetch_resorts(query, (resort_id,))
    if "error" in result:
        return jsonify(result), 500
    resorts = result.get("resorts", [])
    if not resorts:
        return jsonify({"error": "Resort not found"}), 404
    return jsonify({"resort": resorts[0]}), 200

@app.route("/api/colorado", methods=['GET'])
def get_co_resorts():
    """Fetch all ski resorts in Colorado (stateID = 4)."""
    query = """
        SELECT DISTINCT sr.resortID, sr.resort_name, st.state_name, sr.summit, sr.base, sr.lifts,
               sr.runs, sr.green_percent, sr.blue_percent, sr.black_percent, sr.double_black_percent,
               sr.lat, sr.lon, sr.url
        FROM ski_resorts sr
        INNER JOIN states_terr st ON sr.stateID = st.stateID
        WHERE sr.stateID = %s;
    """
    result = fetch_resorts(query, (4,))
    return resorts_response(result)

@app.route("/api/utah", methods=['GET'])
def get_ut_resorts():
    """Fetch all ski resorts in Utah (stateID = 29)."""
    query = """
        SELECT DISTINCT sr.resortID, sr.resort_name, st.state_name, sr.summit, sr.base, sr.lifts,
               sr.runs, sr.green_percent, sr.blue_percent, sr.black_percent, sr.double_black_percent,
               sr.lat, sr.lon, sr.url
        FROM ski_resorts sr
        INNER JOIN states_terr st ON sr.stateID = st.stateID
        WHERE sr.stateID = %s;
    """
    result = fetch_resorts(query, (29,))
    return resorts_response(result)

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
        print(f"[ERROR] OpenWeather request failed: {err}")
        return None
    if upstream.status_code != 200:
        # Log the real status (401 = bad key, 429 = quota) but never expose it to the browser.
        print(f"[ERROR] OpenWeather returned {upstream.status_code} for {url}")
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

    upstream = fetch_openweather(
        OPENWEATHER_WEATHER_URL,
        {"lat": lat, "lon": lon, "units": "imperial"},
    )
    if upstream is None:
        return jsonify({"error": "Weather service unavailable"}), 502
    return jsonify(upstream.json()), 200

@app.route("/api/weather/tiles/<int:z>/<int:x>/<int:y>.png", methods=['GET'])
def get_weather_tile(z, x, y):
    """Proxy OpenWeather precipitation radar tiles so the key never appears in tile URLs."""
    if not OPENWEATHER_API_KEY:
        return weather_not_configured()
    max_index = 2 ** z
    if z > 19 or x >= max_index or y >= max_index:
        return jsonify({"error": "Invalid tile coordinates"}), 400

    upstream = fetch_openweather(OPENWEATHER_TILE_URL.format(z=z, x=x, y=y), {})
    if upstream is None:
        return jsonify({"error": "Weather service unavailable"}), 502
    return Response(
        upstream.content,
        status=200,
        content_type="image/png",
        headers={"Cache-Control": "public, max-age=600"},
    )

if __name__ == "__main__":
    app.run(debug=True, port=8080)
