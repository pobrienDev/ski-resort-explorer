import { useState, useEffect } from "react";
import {
    Container,
    Typography,
    Box,
    TextField,
    CircularProgress,
    useTheme,
} from "@mui/material";
import axios from "axios";
import ResortCard from "../General/ResortCard";
import { API_BASE } from "../../api";

const HeroRidges = () => {
    const theme = useTheme();
    const dark = theme.palette.mode === "dark";
    return (
        <Box
            component="svg"
            viewBox="0 0 1440 180"
            preserveAspectRatio="none"
            aria-hidden="true"
            sx={{
                position: "absolute",
                bottom: -1,
                left: 0,
                width: "100%",
                height: { xs: 90, md: 130 },
                display: "block",
            }}
        >
            <path
                d="M0,180 L0,120 L160,50 L300,130 L470,60 L650,150 L830,55 L1000,140 L1170,75 L1320,135 L1440,95 L1440,180 Z"
                fill={dark ? "#132c44" : "#a8cfe8"}
            />
            <path
                d="M0,180 L0,150 L190,95 L350,160 L560,105 L770,170 L960,105 L1150,165 L1330,115 L1440,145 L1440,180 Z"
                fill={theme.palette.background.default}
            />
        </Box>
    );
};

function Home() {
    const [resorts, setResorts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        axios
            .get(`${API_BASE}/api/resorts`)
            .then((response) => {
                if (response.data && Array.isArray(response.data.resorts)) {
                    // Ensure unique resorts based on resortID
                    const uniqueResorts = Array.from(
                        new Map(response.data.resorts.map((resort) => [resort.resortID, resort])).values()
                    );
                    setResorts(uniqueResorts);
                } else {
                    setError("Invalid data format from the server.");
                }
                setLoading(false);
            })
            .catch(() => {
                setError("Failed to load resorts. Please try again later.");
                setLoading(false);
            });
    }, []);

    const query = searchTerm.trim().toLowerCase();
    const filtered = query
        ? resorts.filter(
              (resort) =>
                  (resort.resort_name?.toLowerCase() || "").includes(query) ||
                  (resort.state_name?.toLowerCase() || "").includes(query)
          )
        : resorts;

    return (
        <Box sx={{ mt: -3 /* cancel the navbar's bottom margin so the hero meets it */ }}>
            <Box
                sx={(theme) => ({
                    position: "relative",
                    overflow: "hidden",
                    textAlign: "center",
                    pt: { xs: 8, md: 11 },
                    pb: { xs: 14, md: 18 },
                    px: 2,
                    background:
                        theme.palette.mode === "dark"
                            ? "linear-gradient(180deg, #0a1626 0%, #10263d 55%, #16324f 100%)"
                            : "linear-gradient(180deg, #7dbde8 0%, #c7e3f6 55%, #eef7fd 100%)",
                })}
            >
                <Container maxWidth="sm" sx={{ position: "relative", zIndex: 1 }}>
                    <Typography
                        variant="h2"
                        component="h1"
                        sx={(theme) => ({
                            fontWeight: 700,
                            letterSpacing: "-0.5px",
                            fontSize: { xs: "2.3rem", md: "3.2rem" },
                            color: theme.palette.mode === "dark" ? "#eaf4fb" : "#0d3a5c",
                        })}
                    >
                        Ski Resort Explorer
                    </Typography>
                    <Typography
                        variant="h6"
                        sx={(theme) => ({
                            fontWeight: 400,
                            mt: 1,
                            mb: 4,
                            color:
                                theme.palette.mode === "dark"
                                    ? "rgba(234,244,251,0.75)"
                                    : "rgba(13,58,92,0.75)",
                        })}
                    >
                        Find your next mountain — stats, trail breakdowns, and weather for
                        hundreds of resorts.
                    </Typography>
                    <TextField
                        fullWidth
                        placeholder="Search by resort or location…"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        sx={{
                            maxWidth: 460,
                            bgcolor: "background.paper",
                            borderRadius: 2,
                            boxShadow: 3,
                            "& fieldset": { border: "none" },
                        }}
                    />
                </Container>
                <HeroRidges />
            </Box>

            <Container sx={{ py: 5 }}>
                {loading ? (
                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                        <CircularProgress />
                        <Typography color="text.secondary">Loading resorts…</Typography>
                    </Box>
                ) : error ? (
                    <Typography align="center" color="text.secondary">
                        {error}
                    </Typography>
                ) : (
                    <>
                        <Typography
                            variant="subtitle1"
                            color="text.secondary"
                            align="center"
                            sx={{ mb: 3 }}
                        >
                            {query
                                ? `${filtered.length} resort${filtered.length === 1 ? "" : "s"} matching "${searchTerm.trim()}"`
                                : `Browsing ${resorts.length} resorts`}
                        </Typography>
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, justifyContent: "center" }}>
                            {filtered.map((resort) => (
                                <ResortCard key={resort.resortID} resort={resort} />
                            ))}
                        </Box>
                        {filtered.length === 0 && (
                            <Typography align="center" color="text.secondary">
                                No resorts found.
                            </Typography>
                        )}
                    </>
                )}
            </Container>
        </Box>
    );
}

export default Home;
