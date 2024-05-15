import { AppBar, Box, IconButton, Stack, Toolbar, Typography } from "@mui/material";

import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";

const Navbar = ({ mode, switchMode }) => {
    return (
        <AppBar
            position="static"
            elevation={0}
            sx={{
                bgcolor: 'background.paper',
                backgroundImage: 'none',
            }}
        >
            <Toolbar variant="dense" disableGutters sx={{ px: 1 }}>
                <Typography variant="h4" fontWeight="bold" color="primary">SCA</Typography>
                <Box sx={{ flex: 1 }}/>
                <Stack direction="row" spacing={1} alignItems="center">
                    <IconButton size="small" onClick={switchMode}>
                        {mode === "light" ? (
                            <DarkModeOutlinedIcon sx={{ color: 'text.secondary' }}/>
                        ) : (
                            <LightModeOutlinedIcon sx={{ color: 'text.secondary' }}/>
                        )}
                    </IconButton>
                    <IconButton sx={{ p: 0 }}>
                        <AccountCircleIcon sx={{ color: 'text.primary', fontSize: 34 }}/>
                    </IconButton>
                </Stack>
            </Toolbar>
        </AppBar>
    );
}

export default Navbar;