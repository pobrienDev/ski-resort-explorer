# Ski Resort Explorer

A full-stack web app for exploring ski resorts — browse resorts on an interactive map and compare stats like summit/base elevation, lifts, runs, and trail difficulty breakdowns.

![Ski Resort Explorer home page](docs/screenshot.png)

## Demo

Search, the interactive resort map, and a resort detail page with live weather:

![Animated demo: searching resorts, browsing the map, and opening a resort detail page](docs/demo.gif)

## Tech stack

- **Frontend** ([client/](client)): React 19 + Vite, Material UI, React Router, Leaflet maps
- **Backend** ([server/](server)): Flask REST API backed by MySQL

## API endpoints

| Endpoint | Description |
| --- | --- |
| `GET /api/resorts` | All ski resorts |
| `GET /api/resorts/<id>` | A single resort by ID |


## Running locally

### Database

Requires a local MySQL server. Create the database and import the included dump (schema + all resort data):

```bash
mysql -u root -e "CREATE DATABASE SkiResorts"
mysql -u root SkiResorts < server/skiresorts.sql
```

### Backend

```bash
cd server
pip install -r requirements.txt
python main.py   # runs on http://localhost:8080
```

Database connection is configured via environment variables (or a `.env` file in `server/`): `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` (defaults to a local MySQL database named `SkiResorts`).

### Frontend

```bash
cd client
cp .env.example .env   # then fill in your OpenWeather API key
npm install
npm run dev            # runs on http://localhost:5173
```

Client environment variables (in `client/.env`): `VITE_WEATHER_API_KEY` (OpenWeather key for the weather panel and radar map) and `VITE_API_BASE_URL` (Flask API origin, defaults to `http://localhost:8080`).