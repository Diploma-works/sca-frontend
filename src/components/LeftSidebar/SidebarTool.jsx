import { useState } from "react";

import { Box, Button, Divider, Menu, MenuItem, Stack, SvgIcon, Tooltip, Typography } from "@mui/material";

import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import RemoveRoundedIcon from "@mui/icons-material/RemoveRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";

import { useSidebarUpdateContext } from "../../contexts/SidebarContext";

const SidebarTool = ({ title, additionalActions = [], disableResizing, setDisableResizing, children }) => {
    const setActiveTool = useSidebarUpdateContext();
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const handleOptionsButtonClick = (e) => setAnchorEl(e.currentTarget);

    const handleHideButtonClick = () => setActiveTool(null);

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
        <Stack sx={{ flex: 1, overflow: 'hidden' }}>
            <Stack
                direction="row"
                sx={{
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                }}
            >
                <Typography
                    noWrap
                    variant={"button"}
                    sx={{
                        pl: 1.5,
                        minWidth: 0,
                        fontWeight: 600,
                        lineHeight: 'normal',
                        textTransform: 'none',
                    }}
                >
                    {title}
                </Typography>
                <Box flex={1}/>
                <Stack
                    direction="row"
                    spacing={1}
                    sx={{
                        p: 1,
                        color: 'text.secondary',
                    }}
                >
                    {actions.map(({ title, icon, props }, index) => (
                        <Tooltip
                            key={index}
                            title={title}
                            placement="bottom"
                            PopperProps={{ modifiers: [{ name: 'offset', options: { offset: [0, 8] } }] }}
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
                                <SvgIcon sx={{ width: 16, height: 16 }}>{icon}</SvgIcon>
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
                <MenuItem onClick={() => setDisableResizing((prevState) => !prevState)}>
                    <SvgIcon sx={{ width: 18, height: 18, mr: 1 }}>
                        {disableResizing && <CheckRoundedIcon/>}
                    </SvgIcon>
                    Оптимальная ширина панели
                </MenuItem>
            </Menu>
        </Stack>
    );
}

export default SidebarTool;