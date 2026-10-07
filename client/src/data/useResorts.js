import { useContext } from "react";
import { ResortsContext } from "./resortsContext";

/** The shared resort list: { resorts, loading, error, reload }. */
export function useResorts() {
    const ctx = useContext(ResortsContext);
    if (!ctx) throw new Error("useResorts must be used inside <ResortsProvider>");
    return ctx;
}

/**
 * One resort from the shared list by id (string or number).
 * notFound is true only once the list has loaded and the id is absent.
 */
export function useResort(resortID) {
    const { byId, loading, error, reload } = useResorts();
    const resort = byId.get(String(resortID)) ?? null;
    return { resort, loading, error, notFound: !loading && !error && !resort, reload };
}
