import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
    Container,
    Typography,
    Box,
    Button,
    Chip,
    Paper,
    Link,
    CircularProgress,
} from "@mui/material";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";  // Import Leaflet styles
import DifficultyBar from "../General/DifficultyBar";
import { API_BASE } from "../../api";

const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;  // OpenWeather API key — set in client/.env

const toFeet = (meters) => {
    const n = Number(meters);
    return meters === "" || meters == null || Number.isNaN(n) ? null : Math.round(n * 3.28084);
};

const formatFeet = (ft) => (ft == null ? "—" : `${ft.toLocaleString()} ft`);

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

    if (loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
                <CircularProgress />
            </Box>
        );
    }
    if (error) {
        return (
            <Typography align="center" color="text.secondary" sx={{ mt: 8 }}>
                {error}
            </Typography>
        );
    }
    if (!resort) {
        return (
            <Typography align="center" color="text.secondary" sx={{ mt: 8 }}>
                Resort not found.
            </Typography>
        );
    }

    const summitFt = toFeet(resort.summit);
    const baseFt = toFeet(resort.base);
    const verticalFt = summitFt != null && baseFt != null ? summitFt - baseFt : null;
    const stats = [
        { label: "Summit", value: formatFeet(summitFt) },
        { label: "Base", value: formatFeet(baseFt) },
        { label: "Vertical drop", value: formatFeet(verticalFt) },
        { label: "Lifts", value: resort.lifts ?? "—" },
        { label: "Runs", value: resort.runs ?? "—" },
    ];

    return (
        <Container maxWidth="md" sx={{ pb: 6 }}>
            <Button onClick={() => navigate(-1)} sx={{ mb: 1 }}>
                ← Back
            </Button>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
                <Typography variant="h3" component="h1" sx={{ fontWeight: 700 }}>
                    {resort.resort_name}
                </Typography>
                <Chip label={resort.state_name} variant="outlined" />
            </Box>

            <Paper variant="outlined" sx={{ mt: 3, p: 3 }}>
                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "repeat(2, 1fr)", sm: "repeat(3, 1fr)", md: "repeat(5, 1fr)" },
                        gap: 2,
                    }}
                >
                    {stats.map((stat) => (
                        <Box key={stat.label}>
                            <Typography variant="overline" color="text.secondary">
                                {stat.label}
                            </Typography>
                            <Typography variant="h5" sx={{ fontWeight: 600 }}>
                                {stat.value}
                            </Typography>
                        </Box>
                    ))}
                </Box>

                <Typography variant="overline" color="text.secondary" sx={{ display: "block", mt: 3 }}>
                    Trail difficulty
                </Typography>
                <DifficultyBar resort={resort} height={10} showLegend sx={{ mt: 0.5 }} />
            </Paper>

            <Button variant="contained" onClick={() => setShowMore((prev) => !prev)} sx={{ mt: 3 }}>
                {showMore ? "Hide weather & radar" : "Weather & radar"}
            </Button>

            {showMore && (
                <Paper variant="outlined" sx={{ mt: 2, p: 3 }}>
                    <Typography>
                        <strong>Current weather: </strong>
                        {weather
                            ? `${weather.weather[0].description}, ${weather.main.temp}°F`
                            : weatherError
                                ? "Weather is unavailable right now."
                                : "Loading..."}
                    </Typography>

                    <Typography variant="h6" sx={{ mt: 2 }}>
                        Weather radar
                    </Typography>
                    <Box sx={{ mt: 1, borderRadius: 2, overflow: "hidden" }}>
                        <MapContainer
                            center={[Number(resort.lat), Number(resort.lon)]}
                            zoom={7}
                            style={{ height: 400, width: "100%" }}
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
                    </Box>

                    {resort.url && (
                        <Typography sx={{ mt: 2 }}>
                            <Link href={resort.url} target="_blank" rel="noopener noreferrer" fontWeight={600}>
                                Official resort website
                            </Link>
                        </Typography>
                    )}
                </Paper>
            )}
        </Container>
    );
};

export default ResortDetail;
