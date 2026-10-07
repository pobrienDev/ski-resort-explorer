import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchResorts } from "../api";
import { ResortsContext } from "./resortsContext";

// Loads the resort list once and shares it with every page. The dataset is a
// few hundred rows, so one request covers the home grid, table, map and
// detail pages, and navigating between them never refetches.
export default function ResortsProvider({ children }) {
    const [resorts, setResorts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            setResorts(await fetchResorts());
        } catch {
            setError("Failed to load resorts. Please try again later.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const value = useMemo(() => {
        const byId = new Map(resorts.map((r) => [String(r.resortID), r]));
        return { resorts, byId, loading, error, reload: load };
    }, [resorts, loading, error, load]);

    return <ResortsContext.Provider value={value}>{children}</ResortsContext.Provider>;
}
