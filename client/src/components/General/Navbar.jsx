import React from "react";
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import { Link } from "react-router-dom";
import "./Navbar.css";


const Navbar = () => {
    return (
        <div className="navbar-container">
            <AppBar position="static" color="primary" sx={{ mb: 3 }}>
                <Toolbar>
                    <Typography variant="h6" sx={{ flexGrow: 1 }}>
                        Ski Resort Explorer
                    </Typography>
                    <Box>
                        <Button color="inherit" component={Link} to="/">
                            Home
                        </Button>
                        <Button color="inherit" component={Link} to="/resorts">
                            Resorts
                        </Button>
                    </Box>
                </Toolbar>
            </AppBar>
        </div>
    );
};

export default Navbar;
