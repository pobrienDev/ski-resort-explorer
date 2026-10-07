import { useNavigate } from "react-router-dom";
import { Box, Typography, Button, CircularProgress, useTheme } from "@mui/material";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "react-leaflet-cluster/dist/assets/MarkerCluster.css";
import { useResorts } from "../../data/useResorts";
import { toFeet } from "../../utils/units";

// Cluster bubbles: a count in a circle, sized by how many resorts it holds.
// Styled via the .resort-cluster rules on the map box below so they follow
// the theme; the library's default cluster stylesheet is not loaded.
const createClusterIcon = (cluster) => {
    const count = cluster.getChildCount();
    const size = count < 10 ? "small" : count < 50 ? "medium" : "large";
    return L.divIcon({
        html: `<span>${count}</span>`,
        className: `resort-cluster resort-cluster-${size}`,
        iconSize: L.point(40, 40),
    });
};

const hasCoords = (resort) =>
    resort.lat !== "" && resort.lat != null && resort.lon !== "" && resort.lon != null &&
    !Number.isNaN(Number(resort.lat)) && !Number.isNaN(Number(resort.lon));

const ResortMap = () => {
    const { resorts, loading, error } = useResorts();
    const navigate = useNavigate();
    const theme = useTheme();
    const dark = theme.palette.mode === "dark";

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
                    // OSM only ships a light style; invert the tile pane for dark
                    // mode. Markers and popups live in other panes and are unaffected.
                    "& .leaflet-tile-pane": dark
                        ? { filter: "invert(1) hue-rotate(180deg) brightness(0.85) contrast(0.9) saturate(0.5)" }
                        : {},
                    "& .resort-cluster": {
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "50%",
                        fontWeight: 700,
                        fontSize: 13,
                        color: dark ? "#0e1721" : "#ffffff",
                        bgcolor: dark ? "#7ab8e0" : "#1a5e8f",
                        border: `3px solid ${dark ? "rgba(122,184,224,0.35)" : "rgba(26,94,143,0.3)"}`,
                        backgroundClip: "padding-box",
                        boxShadow: "0 1px 4px rgba(0,0,0,0.35)",
                    },
                    "& .resort-cluster-medium": { fontSize: 14 },
                    "& .resort-cluster-large": { fontSize: 15, borderWidth: 5 },
                }}
            >
                <MapContainer
                    center={[39.5, -98.35]}
                    zoom={4}
                    scrollWheelZoom
                    style={{ height: "100%", width: "100%" }}
                >
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    <MarkerClusterGroup
                        chunkedLoading
                        maxClusterRadius={45}
                        showCoverageOnHover={false}
                        spiderfyOnMaxZoom
                        iconCreateFunction={createClusterIcon}
                    >
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
                    </MarkerClusterGroup>
                </MapContainer>
            </Box>
        </Box>
    );
};

export default ResortMap;
