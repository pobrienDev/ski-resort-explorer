import { Card, CardContent, CardActions, Typography, Button, Chip, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import DifficultyBar from "./DifficultyBar";

const toFeet = (meters) => {
    const n = Number(meters);
    return meters === "" || meters == null || Number.isNaN(n) ? null : Math.round(n * 3.28084);
};

const ResortCard = ({ resort }) => {
    const navigate = useNavigate();
    const summitFt = toFeet(resort.summit);

    return (
        <Card
            sx={{
                width: 300,
                display: "flex",
                flexDirection: "column",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
                "&:hover": { transform: "translateY(-4px)", boxShadow: 8 },
            }}
        >
            <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 1 }}>
                    <Typography variant="h6" component="h3" sx={{ lineHeight: 1.25 }}>
                        {resort.resort_name}
                    </Typography>
                    <Chip
                        label={resort.state_name}
                        size="small"
                        variant="outlined"
                        sx={{ flexShrink: 0, mt: "2px" }}
                    />
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {summitFt != null ? `${summitFt.toLocaleString()} ft summit` : "Summit —"} ·{" "}
                    {resort.lifts} lifts · {resort.runs} runs
                </Typography>
                <DifficultyBar resort={resort} sx={{ mt: 1.5 }} />
            </CardContent>
            <CardActions sx={{ px: 2, pb: 2, pt: 0 }}>
                <Button
                    size="small"
                    variant="contained"
                    fullWidth
                    disabled={!resort.resortID}
                    onClick={() => navigate(`/resorts/${resort.resortID}`)}
                >
                    View details
                </Button>
            </CardActions>
        </Card>
    );
};

export default ResortCard;
