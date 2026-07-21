from flask import Flask, jsonify
from flask_cors import CORS
import mysql.connector
import os
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

if __name__ == "__main__":
    app.run(debug=True, port=8080)
