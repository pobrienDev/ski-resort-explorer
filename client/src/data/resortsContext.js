import { createContext } from "react";

// Shared by ResortsProvider and the useResorts/useResort hooks. Kept in its
// own module so the provider file only exports a component (fast refresh).
export const ResortsContext = createContext(null);
