import { useEffect, useRef, useState } from "react";
import useSignOut from "react-auth-kit/hooks/useSignOut";
import useAuthUser from "react-auth-kit/hooks/useAuthUser";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import {
    AppBar,
    Box,
    Button,
    Divider,
    IconButton,
    ListSubheader,
    Menu,
    MenuItem,
    Skeleton,
    Stack,
    TextField,
    Toolbar,
    Typography,
    useColorScheme
} from "@mui/material";

import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import FolderIcon from "@mui/icons-material/Folder";
import GitHubIcon from "@mui/icons-material/GitHub";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";

import { ProjectInfo } from "@/components/ProjectInfo";
import { projectAPI } from "@/utils";

const Navbar = () => {
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
    const signOut = useSignOut();
    const authUser = useAuthUser();
    const navigate = useNavigate();
    const location = useLocation();
    const { mode, setMode } = useColorScheme();

    const { isLoading, data: projects } = useQuery({ queryKey: ["projects"], queryFn: projectAPI.getAll });

    const [projectInfoOpen, setProjectInfoOpen] = useState(false);
    const searchInputRef = useRef(null);

    const handleKeyDown = (e) => {
        if (e.ctrlKey && e.code === "KeyF") {
            e.preventDefault();
            e.stopPropagation();
            setProjectInfoOpen(true);
        }
    }

    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    const handleProjectInfoClick = () => setProjectInfoOpen(true);
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
    const handleThemeChange = () => setMode(mode === "light" ? "dark" : "light");

    const isProjectsPage = location.pathname === '/projects';
    const isMainPage = location.pathname === '/' || location.pathname === '/editor';
    const isGitHubPage = location.pathname === '/github';

    return (
        <AppBar
            position="static"
            elevation={0}
            color="inherit"
            sx={{
                borderBottom: '1px solid',
                borderColor: 'divider',
            }}
        >
            <Toolbar variant="dense" disableGutters sx={{ px: 1, gap: 1 }}>
                <Typography
                    variant="h4"
                    fontWeight="bold"
                    color="primary"
                    sx={{ cursor: 'pointer' }}
                    onClick={() => navigate('/')}
                >
                    SCA
                </Typography>
                <Divider variant="middle" orientation="vertical" flexItem/>
                {isLoading ? (
                    <Skeleton animation="wave" variant="rounded">
                        <TextField
                            select
                            size="xs"
                            sx={{ minWidth: 100, }}
                        >
                            <MenuItem/>
                        </TextField>
                    </Skeleton>
                ) : (
                    <TextField
                        select
                        size="xs"
                        value={"12"}
                        sx={{ minWidth: 100, }}
                    >
                        <ListSubheader>
                            Ваши проекты
                        </ListSubheader>
                        {projects.map(({ id, name }) => (
                            <MenuItem key={id} value={id}>{name}</MenuItem>
                        ))}
                        <MenuItem value="123">123</MenuItem>
                        <Divider component="li"/>
                        <ListSubheader>
                            Ваши проекты
                        </ListSubheader>
                        <MenuItem value="12">123</MenuItem>
                        <MenuItem value="1">123</MenuItem>
                    </TextField>
                )}
                <Button
                    variant={isProjectsPage ? "contained" : "text"}
                    startIcon={<FolderIcon/>}
                    onClick={() => navigate('/projects')}
                >
                    Проекты
                </Button>
                <Button
                    variant={isGitHubPage ? "contained" : "text"}
                    startIcon={<GitHubIcon/>}
                    onClick={() => navigate('/github')}
                >
                    GitHub
                </Button>
                <Button
                    variant={isMainPage ? "contained" : "text"}
                    onClick={() => navigate('/')}
                >
                    Редактор
                </Button>
                <Box sx={{ flex: 1 }}/>
                <Stack direction="row" spacing={1} alignItems="center">
                    <IconButton size="small" onClick={handleProjectInfoClick} ref={searchInputRef}>
                        <SearchRoundedIcon sx={{ color: 'text.secondary' }}/>
                    </IconButton>
                    <IconButton size="small" onClick={handleThemeChange}>
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
                    <ProjectInfo open={projectInfoOpen} setOpen={setProjectInfoOpen} anchorRef={searchInputRef}/>
                </Stack>
            </Toolbar>
        </AppBar>
    );
}

export default Navbar;