// Elevation helpers. The API serializes DECIMAL columns as strings (e.g.
// "1200.610") and cells can be NULL or "", so normalize before converting.

const METERS_TO_FEET = 3.28084;

/** Convert a metres value from the API to whole feet, or null if missing/invalid. */
export const toFeet = (meters) => {
    const n = Number(meters);
    return meters === "" || meters == null || Number.isNaN(n) ? null : Math.round(n * METERS_TO_FEET);
};

/** Format a feet value with thousands separators, using an em dash for null. */
export const formatFeet = (ft, { unit = false } = {}) => {
    if (ft == null) return "—";
    const text = ft.toLocaleString();
    return unit ? `${text} ft` : text;
};
