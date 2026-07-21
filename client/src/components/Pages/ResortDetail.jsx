import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";  // Import Leaflet styles
import '/src/components/Pages/ResortDetail.css';
import { API_BASE } from "../../api";

const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;  // OpenWeather API key — set in client/.env

// Percent values can be NULL/empty in the database; 0 is a real value.
const formatPercent = (value) =>
    value === null || value === undefined || value === "" ? "N/A" : `${value}%`;

const ResortDetail = () => {
    const { resortID } = useParams();
    const [resort, setResort] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showMore, setShowMore] = useState(false);
    const [weather, setWeather] = useState(null);
    const [weatherError, setWeatherError] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchResort = async () => {
            try {
                const response = await axios.get(`${API_BASE}/api/resorts/${resortID}`);
                setResort(response.data.resort || null);
            } catch (err) {
                if (err.response && err.response.status === 404) {
                    setResort(null);  // renders "Resort not found."
                } else {
                    setError("Failed to fetch resort data.");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchResort();
    }, [resortID]);

    useEffect(() => {
        if (showMore && resort) {
            const fetchWeather = async () => {
                try {
                    setWeatherError(false);
                    const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather`, {
                        params: {
                            lat: resort.lat,
                            lon: resort.lon,
                            units: "imperial",
                            appid: API_KEY
                        }
                    });
                    setWeather(response.data);
                } catch {
                    setWeatherError(true);
                }
            };

            fetchWeather();
        }
    }, [showMore, resort]);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;
    if (!resort) return <p>Resort not found.</p>;

    return (
        <div className="resort-detail-parent-container">
            <div className="resort-detail-container">
                <h1>{resort.resort_name}</h1>

                <button
                    onClick={() => navigate("/")}
                    style={{
                        marginBottom: '20px',
                        padding: '10px 15px',
                        backgroundColor: '#2196f3',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                    }}
                >
                    Back to Home
                </button>

                <div className="resort-info">
                    <p><strong>Location:</strong> {resort.state_name}</p>
                    <p><strong>Summit:</strong> {(resort.summit * 3.28084).toFixed(0)} ft</p>
                    <p><strong>Base:</strong> {(resort.base * 3.28084).toFixed(0)} ft</p>
                    <p><strong>Lifts:</strong> {resort.lifts}</p>
                    <p><strong>Runs:</strong> {resort.runs}</p>
                    <p><strong>Green Runs:</strong> {formatPercent(resort.green_percent)}</p>
                    <p><strong>Blue Runs:</strong> {formatPercent(resort.blue_percent)}</p>
                    <p><strong>Black Runs:</strong> {formatPercent(resort.black_percent)}</p>
                    <p><strong>Double Black Runs:</strong> {formatPercent(resort.double_black_percent)}</p>
                    <p><strong>Latitude:</strong> {resort.lat}</p>
                    <p><strong>Longitude:</strong> {resort.lon}</p>
                </div>

                <button
                    onClick={() => setShowMore(prev => !prev)}
                    style={{
                        marginTop: '20px',
                        padding: '10px 15px',
                        backgroundColor: '#2196f3',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                    }}
                >
                    {showMore ? "▲ Show Less ▲" : "▼ Show More ▼"}
                </button>

                {showMore && (
                    <div className="additional-info" style={{ marginTop: '20px' }}>
                        <p>
                            <strong>Current Weather: </strong>
                            {weather
                                ? `${weather.weather[0].description}, ${weather.main.temp}°F`
                                : weatherError
                                    ? "Weather is unavailable right now."
                                    : "Loading..."}
                        </p>

                        {/* Weather Radar Map using Leaflet */}
                        <div style={{ marginTop: '20px', textAlign: "center" }}>
                            <h3>Weather Radar</h3>
                            <MapContainer
                                center={[resort.lat, resort.lon]}
                                zoom={7}
                                style={{ height: "400px", width: "600px", borderRadius: "8px" }}
                            >
                                <TileLayer
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    attribution="&copy; OpenStreetMap contributors"
                                />
                                <TileLayer
                                    url={`https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${API_KEY}`}
                                    attribution="&copy; OpenWeather"
                                />
                            </MapContainer>
                        </div>

                        {/* Visit Site Link */}
                        {resort.url && (
                            <p>
                                <strong>Official Ski Resort Website: </strong>
                                <a
                                    href={resort.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ color: "#2196f3", textDecoration: "none", fontWeight: "bold" }}
                                >
                                    Visit Site
                                </a>
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResortDetail;
