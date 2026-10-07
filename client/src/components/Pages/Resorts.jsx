import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
    Box,
    Chip,
    CircularProgress,
    Container,
    FormControl,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TableSortLabel,
    TextField,
    Typography,
} from "@mui/material";
import { useResorts } from "../../data/useResorts";
import DifficultyBar from "../General/DifficultyBar";
import { DIFFICULTY_SEGMENTS, pct } from "../../utils/difficulty";
import { sortResorts } from "../../utils/sort";
import { toFeet, formatFeet } from "../../utils/units";

// Columns hidden below `showFrom` collapse on narrow screens; the table also
// scrolls horizontally, so nothing is ever unreachable.
const COLUMNS = [
    { key: "resort_name", label: "Resort", align: "left" },
    { key: "state_name", label: "Location", align: "left" },
    { key: "summit", label: "Summit (ft)", showFrom: "md", render: (r) => formatFeet(toFeet(r.summit)) },
    { key: "base", label: "Base (ft)", showFrom: "md", render: (r) => formatFeet(toFeet(r.base)) },
    { key: "vertical", label: "Vertical (ft)", render: (r) => formatFeet(toFeet(r.vertical)) },
    { key: "lifts", label: "Lifts", render: (r) => r.lifts ?? "—" },
    { key: "runs", label: "Runs", render: (r) => r.runs ?? "—" },
    { key: "acres", label: "Acres", showFrom: "md", render: (r) => (r.acres == null ? "—" : r.acres.toLocaleString()) },
    { key: "mix", label: "Trail mix", sortable: false, align: "left", render: (r) => <DifficultyBar resort={r} sx={{ minWidth: 110 }} /> },
    ...DIFFICULTY_SEGMENTS.map((s) => ({
        key: s.key,
        label: `${s.short} %`,
        showFrom: "lg",
        render: (r) => <PercentChip value={r[s.key]} segment={s} />,
    })),
];

const hideBelow = (bp) => (bp ? { display: { xs: "none", [bp]: "table-cell" } } : {});

// The resort name stays pinned while the rest of the table scrolls sideways
// on narrow screens. Header cells sit above body cells in the stacking order.
const stickyName = (col, header) =>
    col.key === "resort_name"
        ? {
              position: "sticky",
              left: 0,
              zIndex: header ? 3 : 1,
              bgcolor: "background.paper",
              // Let long names wrap on phones so the pinned column leaves room
              // for the scrolling columns beside it.
              whiteSpace: { xs: "normal", sm: "nowrap" },
              minWidth: { xs: 130, sm: "auto" },
              maxWidth: { xs: 150, sm: "none" },
              boxShadow: { xs: "2px 0 4px -2px rgba(0,0,0,0.3)", sm: "none" },
          }
        : {};

const PercentChip = ({ value, segment }) => {
    if (value == null || value === "") return <Typography component="span" color="text.disabled">—</Typography>;
    const dark = segment.key.includes("black");
    return (
        <Chip
            size="small"
            label={`${pct(value)}%`}
            sx={(theme) => ({
                minWidth: 48,
                fontWeight: 600,
                color: dark ? "#fff" : segment.fill,
                background: dark ? segment.fill : `${segment.fill}24`,
                border: dark ? `1px solid ${theme.palette.mode === "dark" ? "rgba(255,255,255,0.35)" : "transparent"}` : "none",
                textShadow: dark ? "0 1px 2px rgba(0,0,0,0.6)" : "none",
            })}
        />
    );
};

const Resorts = () => {
    const { resorts, loading, error } = useResorts();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [query, setQuery] = useState("");
    // The location filter lives in the URL so the detail page can link to it
    // and the choice survives a reload.
    const location = searchParams.get("location") ?? "";
    const setLocation = (value) =>
        setSearchParams(value ? { location: value } : {}, { replace: true });
    const [sort, setSort] = useState({ key: "resort_name", direction: "asc" });

    const locations = useMemo(
        () => [...new Set(resorts.map((r) => r.state_name).filter(Boolean))].sort((a, b) => a.localeCompare(b)),
        [resorts],
    );

    const rows = useMemo(() => {
        const q = query.trim().toLowerCase();
        const filtered = resorts.filter(
            (r) =>
                (!location || r.state_name === location) &&
                (!q || r.resort_name?.toLowerCase().includes(q) || r.state_name?.toLowerCase().includes(q)),
        );
        return sortResorts(filtered, sort.key, sort.direction);
    }, [resorts, query, location, sort]);

    const handleSort = (key) => {
        setSort((prev) => ({ key, direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc" }));
    };

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

    return (
        <Container maxWidth="xl" sx={{ pb: 4 }}>
            <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 2, mb: 2 }}>
                <Typography variant="h5" component="h1" sx={{ fontWeight: 700, flexGrow: 1 }}>
                    All resorts
                </Typography>
                <TextField
                    size="small"
                    label="Search"
                    placeholder="Resort or location"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    sx={{ minWidth: 220 }}
                />
                <FormControl size="small" sx={{ minWidth: 180 }}>
                    <InputLabel id="location-filter-label">Location</InputLabel>
                    <Select
                        labelId="location-filter-label"
                        label="Location"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                    >
                        <MenuItem value="">All locations</MenuItem>
                        {locations.map((name) => (
                            <MenuItem key={name} value={name}>
                                {name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }} aria-live="polite">
                {rows.length === resorts.length
                    ? `${resorts.length} resorts`
                    : `${rows.length} of ${resorts.length} resorts`}
            </Typography>

            <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: "calc(100vh - 230px)", minHeight: 320 }}>
                <Table stickyHeader size="small" aria-label="Ski resorts">
                    <TableHead>
                        <TableRow>
                            {COLUMNS.map((col) => {
                                const active = sort.key === col.key;
                                const sortable = col.sortable !== false;
                                return (
                                    <TableCell
                                        key={col.key}
                                        align={col.align ?? "right"}
                                        sortDirection={active ? sort.direction : false}
                                        sx={{ fontWeight: 700, whiteSpace: "nowrap", ...hideBelow(col.showFrom), ...stickyName(col, true) }}
                                    >
                                        {sortable ? (
                                            <TableSortLabel
                                                active={active}
                                                direction={active ? sort.direction : "asc"}
                                                onClick={() => handleSort(col.key)}
                                            >
                                                {col.label}
                                            </TableSortLabel>
                                        ) : (
                                            col.label
                                        )}
                                    </TableCell>
                                );
                            })}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows.map((r) => (
                            <TableRow
                                key={r.resortID}
                                hover
                                onClick={() => navigate(`/resorts/${r.resortID}`)}
                                sx={{ cursor: "pointer", "&:hover td": { bgcolor: "action.hover" } }}
                            >
                                {COLUMNS.map((col) => (
                                    <TableCell
                                        key={col.key}
                                        align={col.align ?? "right"}
                                        sx={{ whiteSpace: "nowrap", ...hideBelow(col.showFrom), ...stickyName(col, false) }}
                                    >
                                        {col.key === "resort_name" ? (
                                            <Typography component="span" sx={{ fontWeight: 600 }}>
                                                {r.resort_name}
                                            </Typography>
                                        ) : col.render ? (
                                            col.render(r)
                                        ) : (
                                            r[col.key]
                                        )}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                        {rows.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={COLUMNS.length} align="center" sx={{ py: 6, color: "text.secondary" }}>
                                    No resorts match.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Container>
    );
};

export default Resorts;
