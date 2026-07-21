import React from "react";
import { Card, CardContent, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";


const ResortCard = ({ resort }) => {
    const navigate = useNavigate(); // allows navigation to other pages
    
    const navigateToPage = () => {
        if (resort.resortID) {
            navigate(`/resorts/${resort.resortID}`);
        } else {
            console.log("Couldn't navigate!");
        }
    }
    
    return (
        <Card sx={{ width: 300 }}>
            <CardContent>
                <Typography variant="h5" component="div">
                    {resort.resort_name}
                </Typography>
                <Typography variant="body1" component="div">
                    {resort.state_name}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                    Summit: {(resort.summit * 3.28084).toFixed(0)} ft
                </Typography>
                <Typography variant="body2" color="textSecondary">
                    Lifts: {resort.lifts}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                    Runs: {resort.runs}
                </Typography>
                <Button 
                    onClick={navigateToPage}
                    variant="contained"
                    color="primary"
                    fullWidth sx={{ mt: 2 }}
                >
                    View Details
                </Button>
            </CardContent>
        </Card>
    );
};

export default ResortCard;
