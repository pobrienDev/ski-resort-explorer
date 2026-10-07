// Sorting helpers for the resort table.
//
// The API serializes DECIMAL columns as strings (e.g. "1200.6100") and cells
// can be null, so values are normalized before comparing: numeric strings
// compare as numbers, everything else as case-insensitive text.

export const toComparable = (value) => {
    if (value === null || value === undefined || value === "") return null;
    const num = Number(value);
    return Number.isNaN(num) ? String(value) : num;
};

/**
 * Compare two resorts on `key`. Empty cells always sort last regardless of
 * direction, so the interesting rows stay at the top either way.
 */
export const compareResorts = (a, b, key, direction = "asc") => {
    const aValue = toComparable(a[key]);
    const bValue = toComparable(b[key]);
    if (aValue === null) return bValue === null ? 0 : 1;
    if (bValue === null) return -1;
    const cmp =
        typeof aValue === "number" && typeof bValue === "number"
            ? aValue - bValue
            : String(aValue).localeCompare(String(bValue), undefined, { sensitivity: "base" });
    return direction === "asc" ? cmp : -cmp;
};

/** A new array sorted by `key`; the input is left untouched. */
export const sortResorts = (resorts, key, direction = "asc") =>
    key ? [...resorts].sort((a, b) => compareResorts(a, b, key, direction)) : resorts;
