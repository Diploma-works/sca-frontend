import { AppBar, Badge, Box, Button, IconButton, Stack, Toolbar, Typography } from "@mui/material";

import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';

const NavbarButton = ({ children }) => {
    return (
        <Button color={"inherit"} sx={{
            textTransform: 'none',
            color: 'text.secondary',
            fontSize: 'larger',
            py: 0,
        }}>
            {children}
        </Button>
    )
}

const Navbar = ({ mode, switchMode }) => {
    return (
        <AppBar position="static" sx={{
            bgcolor: 'background.paper',
            backgroundImage: 'none',
            boxShadow: 'none',
        }}>
            <Toolbar variant={"dense"} disableGutters sx={{ px: 1 }}>
                <Typography variant="h4" fontWeight="bold" color="primary">SCA</Typography>
                <Stack ml={2} direction="row" spacing={1}>
                    <NavbarButton>Home</NavbarButton>
                    <NavbarButton>Help</NavbarButton>
                </Stack>
                <Box sx={{ flexGrow: 1 }}/>
                <Stack direction="row" spacing={1} alignItems="center">
                    <IconButton size="small">
                        <Badge color="error" variant="dot">
                            <NotificationsOutlinedIcon sx={{ color: 'text.disabled' }}/>
                        </Badge>
                    </IconButton>
                    <IconButton size="small">
                        <SettingsOutlinedIcon sx={{ color: 'text.disabled' }}/>
                    </IconButton>
                    <IconButton size="small" onClick={() => switchMode(mode)}>
                        {mode === "light" ? <DarkModeOutlinedIcon sx={{ color: 'text.disabled' }}/> :
                            <LightModeOutlinedIcon sx={{ color: 'text.disabled' }}/>}
                    </IconButton>
                    <IconButton sx={{ p: 0 }}>
                        <AccountCircleIcon sx={{ color: 'text.primary', width: 34, height: 34 }}/>
                    </IconButton>
                </Stack>
            </Toolbar>
        </AppBar>
    );
}

export default Navbar;