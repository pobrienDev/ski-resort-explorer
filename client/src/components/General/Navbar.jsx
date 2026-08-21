import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import { Link } from "react-router-dom";

const MountainLogo = () => (
    <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">
        <path d="M1.5 20.5 L9 6.5 L13 13.5 L15.5 9.5 L22.5 20.5 Z" fill="currentColor" />
        <path
            d="M9 6.5 L11 10.2 L10 9.2 L9 10.4 L8 9.2 L7 10.2 Z"
            fill="#ffffff"
            opacity="0.9"
        />
    </svg>
);

const Navbar = () => {
    return (
        <AppBar position="sticky" sx={{ mb: 3 }}>
            <Toolbar>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, flexGrow: 1 }}>
                    <MountainLogo />
                    <Typography
                        variant="h6"
                        component={Link}
                        to="/"
                        sx={{ color: "inherit", textDecoration: "none", fontWeight: 600 }}
                    >
                        Ski Resort Explorer
                    </Typography>
                </Box>
                <Box>
                    <Button color="inherit" component={Link} to="/">
                        Home
                    </Button>
                    <Button color="inherit" component={Link} to="/resorts">
                        Resorts
                    </Button>
                    <Button color="inherit" component={Link} to="/map">
                        Map
                    </Button>
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Navbar;
