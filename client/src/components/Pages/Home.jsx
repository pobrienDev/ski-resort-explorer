import React, { useState, useEffect } from "react";
import { Container, Typography, Box } from "@mui/material";
import axios from "axios";
import ResortCard from "../General/ResortCard";
import SearchBar from "../General/SearchBar";
import { API_BASE } from "../../api";
import './Home.css';


function Home() {
    const [resorts, setResorts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    useEffect(() => {
        axios
            .get(`${API_BASE}/api/resorts`)
            .then((response) => {
                console.log("API Response Data:", response.data.resorts);
                
                if (response.data && Array.isArray(response.data.resorts)) {
                    // Ensure unique resorts based on resortID
                    const uniqueResorts = Array.from(
                        new Map(response.data.resorts.map(resort => [resort.resortID, resort])).values()
                    );
                    
                    console.log("Unique Resorts:", uniqueResorts); // Debugging
                    setResorts(uniqueResorts);
                } else {
                    setError("Invalid data format from the server.");
                }
                setLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching resorts:", error);
                setError("Failed to load resorts. Please try again later.");
                setLoading(false);
            });
    }, []);
    
    if (loading) {
        return (
            <Container>
                <Typography variant="h3" component="h1" gutterBottom align="center">
                    Ski Resort Explorer
                </Typography>
                <Typography variant="h6" color="textSecondary" align="center" gutterBottom>
                    Loading resorts data...
                </Typography>
            </Container>
        );
    }
    
    if (error) {
        return (
            <Container>
                <Typography variant="h3" component="h1" gutterBottom align="center">
                    Ski Resort Explorer
                </Typography>
                <Typography variant="h6" color="textSecondary" align="center" gutterBottom>
                    {error}
                </Typography>
            </Container>
        );
    }
    
    return (
        <div className="home-container">
            <Container>
                <Typography variant="h3" component="h1" gutterBottom align="center">
                    Ski Resort Explorer
                </Typography>
                <Typography variant="h6" color="textSecondary" align="center" gutterBottom>
                    Discover the best ski resorts from around the world!
                </Typography>
                <SearchBar resorts={resorts} />
            </Container>
        </div>
    );
}

export default Home;
