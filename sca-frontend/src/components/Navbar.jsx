import { AppBar, Box, IconButton, Stack, Toolbar, Button } from "@mui/material";

import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import FolderIcon from "@mui/icons-material/Folder";
import GitHubIcon from "@mui/icons-material/GitHub";
import { useState } from "react";
import useSignOut from "react-auth-kit/hooks/useSignOut";
import useAuthUser from "react-auth-kit/hooks/useAuthUser";
import { useNavigate, useLocation } from "react-router-dom";
import { Menu, MenuItem, Typography } from "@mui/material";

const Navbar = ({ mode, switchMode }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
    const signOut = useSignOut();
    const authUser = useAuthUser();
    const navigate = useNavigate();
    const location = useLocation();

    const handleAccountClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };
    const handleLogout = () => {
        signOut();
        handleClose();
        navigate("/auth");
    };

    const isProjectsPage = location.pathname === '/projects';
    const isMainPage = location.pathname === '/' || location.pathname === '/editor';
    const isGitHubPage = location.pathname === '/github';

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
                <Typography 
                    variant="h4" 
                    fontWeight="bold" 
                    color="primary"
                    sx={{ cursor: 'pointer' }}
                    onClick={() => navigate('/')}
                >
                    SCA
                </Typography>
                <Box sx={{ flex: 1 }}/>
                <Stack direction="row" spacing={1} alignItems="center">
                    <Button
                        variant={isProjectsPage ? "contained" : "text"}
                        startIcon={<FolderIcon />}
                        onClick={() => navigate('/projects')}
                        sx={{ mr: 1 }}
                    >
                        Проекты
                    </Button>
                    <Button
                        variant={isGitHubPage ? "contained" : "text"}
                        startIcon={<GitHubIcon />}
                        onClick={() => navigate('/github')}
                        sx={{ mr: 1 }}
                    >
                        GitHub
                    </Button>
                    <Button
                        variant={isMainPage ? "contained" : "text"}
                        onClick={() => navigate('/')}
                        sx={{ mr: 1 }}
                    >
                        Редактор
                    </Button>
                    <IconButton size="small" onClick={switchMode}>
                        {mode === "light" ? (
                            <DarkModeOutlinedIcon sx={{ color: 'text.secondary' }}/>
                        ) : (
                            <LightModeOutlinedIcon sx={{ color: 'text.secondary' }}/>
                        )}
                    </IconButton>
                    <IconButton sx={{ p: 0 }} onClick={handleAccountClick}>
                        <AccountCircleIcon sx={{ color: 'text.primary', fontSize: 34 }}/>
                    </IconButton>
                    <Menu
                        anchorEl={anchorEl}
                        open={open}
                        onClose={handleClose}
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                    >
                        {authUser && authUser.fullName && (
                            <MenuItem disabled>
                                <Typography variant="subtitle2">{authUser.fullName}</Typography>
                            </MenuItem>
                        )}
                        <MenuItem onClick={handleLogout}>Выйти</MenuItem>
                    </Menu>
                </Stack>
            </Toolbar>
        </AppBar>
    );
}

export default Navbar;