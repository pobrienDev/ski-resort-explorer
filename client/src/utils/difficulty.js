// Standard North American trail-rating colours, shared by the difficulty bar
// and the table chips so the two never drift apart.
export const DIFFICULTY_SEGMENTS = [
    { key: "green_percent", label: "Green", short: "Green", fill: "#388e3c" },
    { key: "blue_percent", label: "Blue", short: "Blue", fill: "#1e88e5" },
    { key: "black_percent", label: "Black", short: "Black", fill: "#1b1b1b" },
    {
        key: "double_black_percent",
        label: "Double Black",
        short: "Dbl Black",
        fill: "repeating-linear-gradient(135deg, #1b1b1b 0 5px, #5c6b73 5px 9px)",
    },
];

/** Numeric percent or 0 for missing/invalid values. */
export const pct = (value) => {
    const n = Number(value);
    return value === "" || value == null || Number.isNaN(n) ? 0 : Math.max(0, n);
};
