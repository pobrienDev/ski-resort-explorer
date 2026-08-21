import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Resorts.css"; // Import the CSS file for the table styling
import { API_BASE } from "../../api";

// The API serializes DECIMAL columns as strings (e.g. "1200.610"), and cells
// can be NULL/empty — normalize before comparing so sorting stays numeric.
const toComparable = (value) => {
    if (value === null || value === undefined || value === "") return null;
    const num = Number(value);
    return Number.isNaN(num) ? value.toString() : num;
};

const toFeet = (meters) => {
    const n = Number(meters);
    return meters === "" || meters == null || Number.isNaN(n) ? null : Math.round(n * 3.28084);
};

const formatFeet = (meters) => {
    const ft = toFeet(meters);
    return ft == null ? "—" : ft.toLocaleString();
};

const renderPercent = (value, kind) =>
    value === "" || value == null ? (
        <span className="pct-empty">—</span>
    ) : (
        <span className={`pct-chip pct-${kind}`}>{value}%</span>
    );

const Resorts = () => {
    const [resorts, setResorts] = useState([]);
    const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchResorts = async () => {
            try {
                const response = await axios.get(`${API_BASE}/api/resorts`);
                if (Array.isArray(response.data.resorts)) {
                    setResorts(response.data.resorts);
                } else {
                    setError("Data format is invalid.");
                }
            } catch {
                setError("Failed to fetch resorts data.");
            } finally {
                setLoading(false);
            }
        };

        fetchResorts();
    }, []);

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

        setResorts((prevResorts) =>
            [...prevResorts].sort((a, b) => {
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
            })
        );
    };

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
                                    <td>{formatFeet(resort.summit)}</td>
                                    <td>{formatFeet(resort.base)}</td>
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
