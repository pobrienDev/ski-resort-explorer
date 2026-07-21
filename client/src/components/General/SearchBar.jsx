import React, { useState } from "react";
import ResortCard from './ResortCard';
import { Typography, TextField, Box } from "@mui/material";

const SearchBar = ({ resorts }) => {
    const [searchTerm, setSearchTerm] = useState("");

    // Filter resorts based on the search term (if there is one)
    const filteredResorts = searchTerm
        ? resorts.filter(resort =>
            // Case-insensitive search for resort_name or state_name
            ((resort.resort_name?.toLowerCase() || "").includes(searchTerm.toLowerCase())) ||
            ((resort.state_name?.toLowerCase() || "").includes(searchTerm.toLowerCase()))
        )
        : resorts;  // Return all resorts if no search term

    return (
        <Box sx={{ textAlign: "center", mt: 3 }}>
            <TextField
                label="Search Resorts by name or location"
                variant="outlined"
                fullWidth
                sx={{ mb: 3, maxWidth: 400 }}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, justifyContent: "center" }}>
                {filteredResorts.length > 0 ? (
                    filteredResorts.map((resort, index) => (
                        <ResortCard key={resort.id || resort.resort_name || index} resort={resort} />
                    ))
                ) : (
                    <Typography variant="body1">
                        {searchTerm ? "No resorts found" : "No resorts available"}
                    </Typography>
                )}
            </Box>
        </Box>
    );
};

export default SearchBar;
