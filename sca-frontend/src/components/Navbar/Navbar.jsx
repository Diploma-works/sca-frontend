import { useEffect, useRef, useState } from "react";
import useSignOut from "react-auth-kit/hooks/useSignOut";
import useAuthUser from "react-auth-kit/hooks/useAuthUser";
import { Link, NavLink, useMatches, useNavigate } from "react-router-dom";
import {
    AppBar,
    Box,
    Breadcrumbs,
    breadcrumbsClasses,
    Button,
    Divider,
    Drawer,
    drawerClasses,
    IconButton,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Menu,
    MenuItem,
    Stack,
    Toolbar,
    Typography,
    useColorScheme
} from "@mui/material";

import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import NavigateNextRoundedIcon from "@mui/icons-material/NavigateNextRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";

import { Logo } from "@/components";
import { navRoutes } from "@/routes";
import { SearchPopover } from "./SearchPopover";

export const Navbar = () => {
    const signOut = useSignOut();
    const authUser = useAuthUser();
    const navigate = useNavigate();
    const matches = useMatches();
    const crumbMatches = matches.filter(({ handle }) => handle?.CrumbComponent || handle?.title);
    const { mode, setMode } = useColorScheme();

    const [drawerOpen, setDrawerOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const searchInputRef = useRef(null);
    const avatarRef = useRef(null);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.ctrlKey && e.code === "KeyF") {
                e.preventDefault();
                e.stopPropagation();
                setSearchOpen(true);
            }
        }

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    const handleDrawerClick = () => setDrawerOpen(true);
    const handleDrawerClose = () => setDrawerOpen(false);
    const handleProjectInfoClick = () => setSearchOpen(true);
    const handleThemeClick = () => setMode(mode === "light" ? "dark" : "light");
    const handleProfileClick = () => setProfileOpen(true);
    const handleProfileClose = () => setProfileOpen(false);
    const handleLogoutClick = () => {
        signOut();
        handleProfileClose();
        navigate("/auth");
    };

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
                <IconButton size="small" onClick={handleDrawerClick}>
                    <MenuRoundedIcon/>
                </IconButton>
                <Drawer
                    open={drawerOpen}
                    onClose={handleDrawerClose}
                    sx={{
                        [`.${drawerClasses.paper}`]: {
                            width: 250,
                        },
                    }}
                >
                    <Toolbar variant="dense" disableGutters sx={{ justifyContent: "center" }}>
                        <Logo/>
                    </Toolbar>
                    <Divider/>
                    <List sx={{ px: 1 }}>
                        {navRoutes.map(({ path, handle }) => (
                            <ListItem key={path} disablePadding>
                                <NavLink to={path} style={{ width: '100%', color: 'inherit', textDecoration: 'none' }}>
                                    {({ isActive }) => (
                                        <ListItemButton dense selected={isActive} sx={{ borderRadius: 1 }}>
                                            <ListItemText
                                                primary={handle?.title}
                                                slotProps={{ primary: { sx: { fontWeight: isActive && 600 } } }}
                                            />
                                        </ListItemButton>
                                    )}
                                </NavLink>
                            </ListItem>
                        ))}
                    </List>
                </Drawer>
                <Logo/>
                {crumbMatches && (
                    <Breadcrumbs
                        separator={<NavigateNextRoundedIcon fontSize="small"/>}
                        sx={(theme) => ({
                            [`.${breadcrumbsClasses.ol}`]: {
                                flexWrap: "nowrap",
                            },
                            [`.${breadcrumbsClasses.li}`]: {
                                color: "text.primary",
                            },
                            [`.${breadcrumbsClasses.separator}`]: {
                                margin: `0 ${theme.spacing(0.5)}`,
                            },
                        })}
                    >
                        {crumbMatches.map(({ handle: { CrumbComponent, title }, ...rest }, index) => (
                            CrumbComponent ? (
                                <CrumbComponent {...rest}/>
                            ) : (
                                <Button
                                    component={Link}
                                    to={rest.pathname}
                                    color="inherit"
                                    sx={{ fontWeight: index === crumbMatches.length - 1 && 600 }}
                                >
                                    {title}
                                </Button>
                            )))}
                    </Breadcrumbs>
                )}
                <Box sx={{ flex: 1 }}/>
                <Stack direction="row" spacing={1} alignItems="center">
                    <IconButton size="small" onClick={handleProjectInfoClick} ref={searchInputRef}>
                        <SearchRoundedIcon sx={{ color: 'text.secondary' }}/>
                    </IconButton>
                    <IconButton size="small" onClick={handleThemeClick}>
                        {mode === "light" ? (
                            <DarkModeOutlinedIcon sx={{ color: 'text.secondary' }}/>
                        ) : (
                            <LightModeOutlinedIcon sx={{ color: 'text.secondary' }}/>
                        )}
                    </IconButton>
                    <IconButton sx={{ p: 0 }} onClick={handleProfileClick} ref={avatarRef}>
                        <AccountCircleIcon sx={{ color: 'text.primary', fontSize: 34 }}/>
                    </IconButton>
                    <Menu
                        anchorEl={() => avatarRef.current}
                        open={profileOpen}
                        onClose={handleProfileClose}
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                    >
                        {authUser && authUser.fullName && (
                            <MenuItem disabled>
                                <Typography variant="subtitle2">{authUser.fullName}</Typography>
                            </MenuItem>
                        )}
                        <MenuItem onClick={handleLogoutClick}>Выйти</MenuItem>
                    </Menu>
                    <SearchPopover open={searchOpen} setOpen={setSearchOpen} anchorRef={searchInputRef}/>
                </Stack>
            </Toolbar>
        </AppBar>
    );
}