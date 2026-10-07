import { useMemo, useState } from "react";
import "./Resorts.css"; // Import the CSS file for the table styling
import { useResorts } from "../../data/useResorts";
import { toFeet, formatFeet } from "../../utils/units";

// The API serializes DECIMAL columns as strings (e.g. "1200.610"), and cells
// can be NULL/empty — normalize before comparing so sorting stays numeric.
const toComparable = (value) => {
    if (value === null || value === undefined || value === "") return null;
    const num = Number(value);
    return Number.isNaN(num) ? value.toString() : num;
};


const formatMetersAsFeet = (meters) => formatFeet(toFeet(meters));

const renderPercent = (value, kind) =>
    value === "" || value == null ? (
        <span className="pct-empty">—</span>
    ) : (
        <span className={`pct-chip pct-${kind}`}>{value}%</span>
    );

const Resorts = () => {
    const { resorts: allResorts, loading, error } = useResorts();
    const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

    const columnMappings = {
        "Resort Name": "resort_name",
        "Location": "state_name",
        "Summit (ft)": "summit",
        "Base (ft)": "base",
        "Lifts": "lifts",
        "Runs": "runs",
        "Green %": "green_percent",
        "Blue %": "blue_percent",
        "Black %": "black_percent",
        "Double Black %": "double_black_percent",
    };

    const handleSort = (columnName) => {
        const key = columnMappings[columnName];
        if (!key) return;

        let direction = "asc";
        if (sortConfig.key === key && sortConfig.direction === "asc") {
            direction = "desc";
        }
        setSortConfig({ key, direction });
    };

    // Derive the sorted view instead of mutating the shared list.
    const resorts = useMemo(() => {
        const { key, direction } = sortConfig;
        if (!key) return allResorts;
        return [...allResorts].sort((a, b) => {
            const aValue = toComparable(a[key]);
            const bValue = toComparable(b[key]);

            // Empty cells always sort last, regardless of direction
            if (aValue === null) return bValue === null ? 0 : 1;
            if (bValue === null) return -1;

            const cmp =
                typeof aValue === "number" && typeof bValue === "number"
                    ? aValue - bValue
                    : aValue.toString().localeCompare(bValue.toString());
            return direction === "asc" ? cmp : -cmp;
        });
    }, [allResorts, sortConfig]);

    if (loading) return <p style={{ textAlign: "center" }}>Loading resorts data...</p>;
    if (error) return <p style={{ textAlign: "center" }}>{error}</p>;

    return (
        <div className="resort-parent-container">
            <div className="resort-table-container">
                <h2>Resorts Data Table</h2>
                <table className="resort-table">
                    <thead>
                        <tr>
                            {Object.keys(columnMappings).map((columnName) => (
                                <th
                                    key={columnName}
                                    onClick={() => handleSort(columnName)}
                                    className={sortConfig.key === columnMappings[columnName] ? `sorted-${sortConfig.direction}` : ""}
                                >
                                    {columnName}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {resorts.length > 0 ? (
                            resorts.map((resort) => (
                                <tr key={resort.resortID}>
                                    <td>{resort.resort_name}</td>
                                    <td>{resort.state_name}</td>
                                    <td>{formatMetersAsFeet(resort.summit)}</td>
                                    <td>{formatMetersAsFeet(resort.base)}</td>
                                    <td>{resort.lifts}</td>
                                    <td>{resort.runs}</td>
                                    <td>{renderPercent(resort.green_percent, "green")}</td>
                                    <td>{renderPercent(resort.blue_percent, "blue")}</td>
                                    <td>{renderPercent(resort.black_percent, "black")}</td>
                                    <td>{renderPercent(resort.double_black_percent, "dblack")}</td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan="10">No data available</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Resorts;
