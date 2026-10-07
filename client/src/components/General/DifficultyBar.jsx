import { Box, Tooltip, Typography } from "@mui/material";
import { DIFFICULTY_SEGMENTS as SEGMENTS, pct } from "../../utils/difficulty";

// Black is required by the domain even though it has no chroma, so identity is
// never color-alone: segments are separated by 2px gaps, outlined for contrast
// on dark surfaces, tooltipped, and (with showLegend) labeled directly.
const outline = (theme) =>
    `1px solid ${theme.palette.mode === "dark" ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.15)"}`;

const DifficultyBar = ({ resort, height = 8, showLegend = false, sx }) => {
    const parts = SEGMENTS
        .map((s) => ({ ...s, value: pct(resort[s.key]) }))
        .filter((s) => s.value > 0);
    const total = parts.reduce((sum, s) => sum + s.value, 0);
    if (total <= 0) return null;

    return (
        <Box sx={sx}>
            <Box sx={{ display: "flex", gap: "2px", height, width: "100%" }}>
                {parts.map((s) => (
                    <Tooltip key={s.key} title={`${s.label} ${s.value}%`} arrow>
                        <Box
                            sx={(theme) => ({
                                width: `${(s.value / total) * 100}%`,
                                minWidth: 5,
                                background: s.fill,
                                borderRadius: "3px",
                                border: outline(theme),
                                boxSizing: "border-box",
                            })}
                        />
                    </Tooltip>
                ))}
            </Box>
            {showLegend && (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mt: 1 }}>
                    {parts.map((s) => (
                        <Box key={s.key} sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                            <Box
                                sx={(theme) => ({
                                    width: 12,
                                    height: 12,
                                    borderRadius: "3px",
                                    background: s.fill,
                                    border: outline(theme),
                                })}
                            />
                            <Typography variant="caption" color="text.secondary">
                                {s.label} {s.value}%
                            </Typography>
                        </Box>
                    ))}
                </Box>
            )}
        </Box>
    );
};

export default DifficultyBar;
