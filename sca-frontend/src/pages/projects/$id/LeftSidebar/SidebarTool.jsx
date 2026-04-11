import { useState } from "react";

import { Box, Button, Divider, Menu, MenuItem, Stack, SvgIcon, Tooltip, Typography, useTheme } from "@mui/material";

import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import RemoveRoundedIcon from "@mui/icons-material/RemoveRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";

import { useSidebarUpdateContext } from "./SidebarContext";

const SidebarTool = ({ title, additionalActions = [], disableResizing, setDisableResizing, children }) => {
    const theme = useTheme();
    const setActiveTool = useSidebarUpdateContext();
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const handleOptionsButtonClick = (e) => setAnchorEl(e.currentTarget);
    const handleHideButtonClick = () => setActiveTool(null);
    const handleOptionClick = () => setDisableResizing((prevState) => !prevState);
    const handleClose = () => setAnchorEl(null);

    const actions = [
        ...additionalActions,
        {
            title: "Настройки",
            icon: <MoreVertRoundedIcon/>,
            props: {
                color: open ? "bg" : "inherit",
                variant: open ? "contained" : "text",
                onClick: handleOptionsButtonClick,
            }
        },
        {
            title: "Скрыть",
            icon: <RemoveRoundedIcon/>,
            props: {
                onClick: handleHideButtonClick,
            }
        }
    ];

    return (
        <Stack sx={{
            flex: 1,
            borderRadius: 1,
            overflow: 'hidden',
            bgcolor: 'background.paper',
        }}>
            <Stack direction="row" sx={{ pl: 1.5, alignItems: 'center', justifyContent: 'flex-end' }}>
                <Typography noWrap variant="subtitle2">{title}</Typography>
                <Box flex={1}/>
                <Stack direction="row" spacing={1} sx={{ p: 1, color: 'text.secondary' }}>
                    {actions.map(({ title, icon, props }, index) => (
                        <Tooltip
                            key={index}
                            title={title}
                            placement="bottom"
                            PopperProps={{
                                modifiers: [{
                                    name: 'offset',
                                    options: { offset: [0, parseInt(theme.spacing(1))] }
                                }]
                            }}
                        >
                            <Button
                                color="inherit"
                                disableElevation
                                sx={{
                                    p: 2 / 8,
                                    minWidth: 0,
                                }}
                                {...props}
                            >
                                <SvgIcon sx={{ fontSize: 16 }}>{icon}</SvgIcon>
                            </Button>
                        </Tooltip>
                    ))}
                </Stack>
            </Stack>
            <Divider/>
            {children}
            <Menu
                open={open}
                anchorEl={anchorEl}
                marginThreshold={null}
                onClose={handleClose}
            >
                <MenuItem onClick={handleOptionClick}>
                    <SvgIcon sx={{ fontSize: 18, mr: 1 }}>
                        {disableResizing && <CheckRoundedIcon/>}
                    </SvgIcon>
                    Оптимальная ширина панели
                </MenuItem>
            </Menu>
        </Stack>
    );
}

export default SidebarTool;