import { useEffect, useState } from "react";
import { useParams, useNavigate, Link as RouterLink } from "react-router-dom";
import {
    Container,
    Typography,
    Box,
    Button,
    Chip,
    Paper,
    Link,
    CircularProgress,
    useTheme,
} from "@mui/material";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";  // Import Leaflet styles
import DifficultyBar from "../General/DifficultyBar";
import { fetchWeather, WEATHER_TILE_URL } from "../../api";
import { useResort } from "../../data/useResorts";
import { toFeet, formatFeet } from "../../utils/units";


// The API serializes DATE columns in RFC 1123 form ("Mon, 05 Oct 2026 00:00:00 GMT").
const formatVerifiedOn = (value) => {
    const d = new Date(value);
    return Number.isNaN(d.getTime())
        ? value
        : d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" });
};

// OSM only ships a light style; invert the tile pane for dark mode. The radar
// overlay and controls live in other panes and are unaffected.
const darkTileFilter = {
    "& .leaflet-tile-pane": {
        filter: "invert(1) hue-rotate(180deg) brightness(0.85) contrast(0.9) saturate(0.5)",
    },
    // The radar overlay sits in the tile pane too; lift it back out of the inversion.
    "& .leaflet-tile-pane .radar-overlay": { filter: "invert(1) hue-rotate(180deg)" },
};

const hasRatings = (resort) =>
    ["green_percent", "blue_percent", "black_percent", "double_black_percent"].some(
        (k) => resort[k] != null && resort[k] !== "" && Number(resort[k]) > 0,
    );

const ResortDetail = () => {
    const { resortID } = useParams();
    const { resort, loading, error } = useResort(resortID);
    const [showMore, setShowMore] = useState(false);
    // Weather is cached per resort so toggling the panel does not refetch.
    const [weather, setWeather] = useState({ forID: null, data: null, failed: false });
    const navigate = useNavigate();
    const dark = useTheme().palette.mode === "dark";

    // React Router records an index in history state; 0 means this page was
    // opened directly, so "back" would leave the site. Go home instead.
    const goBack = () => {
        if ((window.history.state?.idx ?? 0) > 0) navigate(-1);
        else navigate("/");
    };

    useEffect(() => {
        if (!showMore || !resort || weather.forID === resort.resortID) return;
        let cancelled = false;
        // Flask proxies this to OpenWeather; the API key never reaches the browser.
        fetchWeather(resort.lat, resort.lon)
            .then((data) => !cancelled && setWeather({ forID: resort.resortID, data, failed: false }))
            .catch(() => !cancelled && setWeather({ forID: resort.resortID, data: null, failed: true }));
        return () => {
            cancelled = true;
        };
    }, [showMore, resort, weather.forID]);

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

    // Vertical is the resort's published lift-served drop, which can differ
    // from summit minus base (e.g. where the summit is not lift-served).
    const stats = [
        { label: "Summit", value: formatFeet(toFeet(resort.summit), { unit: true }) },
        { label: "Base", value: formatFeet(toFeet(resort.base), { unit: true }) },
        { label: "Vertical drop", value: formatFeet(toFeet(resort.vertical), { unit: true }) },
        { label: "Lifts", value: resort.lifts ?? "—" },
        { label: "Runs", value: resort.runs ?? "—" },
        { label: "Skiable acres", value: resort.acres != null ? resort.acres.toLocaleString() : "—" },
    ];

    return (
        <Container maxWidth="md" sx={{ pb: 6 }}>
            <Button onClick={goBack} sx={{ mb: 1 }}>
                ← Back
            </Button>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
                <Typography variant="h3" component="h1" sx={{ fontWeight: 700 }}>
                    {resort.resort_name}
                </Typography>
                <Chip
                    label={resort.state_name}
                    variant="outlined"
                    component={RouterLink}
                    to={`/resorts?location=${encodeURIComponent(resort.state_name)}`}
                    clickable
                />
                {resort.url && (
                    <Button
                        variant="outlined"
                        size="small"
                        href={resort.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{ ml: { sm: "auto" } }}
                    >
                        Official website ↗
                    </Button>
                )}
            </Box>

            <Paper variant="outlined" sx={{ mt: 3, p: 3 }}>
                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "repeat(2, 1fr)", sm: "repeat(3, 1fr)", md: "repeat(6, 1fr)" },
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

                {hasRatings(resort) && (
                    <>
                        <Typography variant="overline" color="text.secondary" sx={{ display: "block", mt: 3 }}>
                            Trail difficulty
                        </Typography>
                        <DifficultyBar resort={resort} height={10} showLegend sx={{ mt: 0.5 }} />
                    </>
                )}

                {resort.source_url && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 2 }}>
                        Stats verified against{" "}
                        <Link href={resort.source_url} target="_blank" rel="noopener noreferrer">
                            {new URL(resort.source_url).hostname.replace(/^www\./, "")}
                        </Link>
                        {resort.verified_on && ` on ${formatVerifiedOn(resort.verified_on)}`}
                    </Typography>
                )}
            </Paper>

            <Button variant="contained" onClick={() => setShowMore((prev) => !prev)} sx={{ mt: 3 }}>
                {showMore ? "Hide weather & radar" : "Weather & radar"}
            </Button>

            {showMore && (
                <Paper variant="outlined" sx={{ mt: 2, p: 3 }}>
                    <Typography>
                        <strong>Current weather: </strong>
                        {weather.data && weather.forID === resort.resortID
                            ? `${weather.data.weather?.[0]?.description ?? "Conditions unavailable"}, ${weather.data.main?.temp ?? "—"}°F`
                            : weather.failed && weather.forID === resort.resortID
                                ? "Weather is unavailable right now."
                                : "Loading..."}
                    </Typography>

                    <Typography variant="h6" sx={{ mt: 2 }}>
                        Weather radar
                    </Typography>
                    <Box sx={{ mt: 1, borderRadius: 2, overflow: "hidden", ...(dark ? darkTileFilter : {}) }}>
                        <MapContainer
                            center={[Number(resort.lat), Number(resort.lon)]}
                            zoom={7}
                            style={{ height: 400, width: "100%" }}
                        >
                            <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution="&copy; OpenStreetMap contributors"
                            />
                            <TileLayer url={WEATHER_TILE_URL} attribution="&copy; OpenWeather" className="radar-overlay" />
                        </MapContainer>
                    </Box>

                </Paper>
            )}
        </Container>
    );
};

export default ResortDetail;
