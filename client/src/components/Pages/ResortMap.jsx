import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Box, Typography, Button, CircularProgress, useTheme } from "@mui/material";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { API_BASE } from "../../api";

const toFeet = (meters) => {
    const n = Number(meters);
    return meters === "" || meters == null || Number.isNaN(n) ? null : Math.round(n * 3.28084);
};

const hasCoords = (resort) =>
    resort.lat !== "" && resort.lat != null && resort.lon !== "" && resort.lon != null &&
    !Number.isNaN(Number(resort.lat)) && !Number.isNaN(Number(resort.lon));

const ResortMap = () => {
    const [resorts, setResorts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const theme = useTheme();
    const dark = theme.palette.mode === "dark";

    useEffect(() => {
        axios
            .get(`${API_BASE}/api/resorts`)
            .then((response) => {
                setResorts(Array.isArray(response.data.resorts) ? response.data.resorts : []);
                setLoading(false);
            })
            .catch(() => {
                setError("Failed to load resorts.");
                setLoading(false);
            });
    }, []);

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

    const located = resorts.filter(hasCoords);

    return (
        <Box sx={{ px: 2, pb: 2 }}>
            <Box
                sx={{
                    height: "calc(100vh - 140px)",
                    minHeight: 420,
                    borderRadius: 2,
                    overflow: "hidden",
                }}
            >
                <MapContainer
                    center={[39.5, -98.35]}
                    zoom={4}
                    scrollWheelZoom
                    style={{ height: "100%", width: "100%" }}
                >
                    <TileLayer
                        key={dark ? "dark" : "light"}
                        url={
                            dark
                                ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                                : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                        }
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    />
                    {located.map((resort) => {
                        const summitFt = toFeet(resort.summit);
                        return (
                            <CircleMarker
                                key={resort.resortID}
                                center={[Number(resort.lat), Number(resort.lon)]}
                                radius={6}
                                pathOptions={{
                                    color: dark ? "#0e1721" : "#ffffff",
                                    weight: 1.5,
                                    fillColor: dark ? "#7ab8e0" : "#1a5e8f",
                                    fillOpacity: 0.9,
                                }}
                            >
                                <Popup>
                                    <strong>{resort.resort_name}</strong>
                                    <br />
                                    {resort.state_name}
                                    {summitFt != null && (
                                        <>
                                            <br />
                                            {summitFt.toLocaleString()} ft summit
                                        </>
                                    )}
                                    <br />
                                    <Button
                                        size="small"
                                        variant="contained"
                                        sx={{ mt: 1 }}
                                        onClick={() => navigate(`/resorts/${resort.resortID}`)}
                                    >
                                        View details
                                    </Button>
                                </Popup>
                            </CircleMarker>
                        );
                    })}
                </MapContainer>
            </Box>
        </Box>
    );
};

export default ResortMap;
