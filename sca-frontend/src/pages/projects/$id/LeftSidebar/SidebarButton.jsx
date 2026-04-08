import { Button, SvgIcon, Tooltip, Zoom } from "@mui/material";

const SidebarButton = ({ title, icon, onClick, isActive }) => {
    return (
        <Tooltip
            title={title}
            placement="right"
            disableInteractive
            TransitionComponent={Zoom}
            PopperProps={{
                sx: {
                    lineHeight: '18px',
                    pl: { xs: 4 / 8, md: 1 },
                },
                modifiers: [{
                    name: 'offset',
                    options: { offset: [0, 8] },
                }],
            }}
        >
            <Button
                variant={isActive ? "contained" : "text"}
                color={isActive ? "bg" : "inherit"}
                disableElevation
                onClick={onClick}
                sx={{
                    p: 4 / 8,
                    minWidth: 0,
                    color: 'text.secondary',
                }}
            >
                <SvgIcon sx={{ fontSize: 20 }}>{icon}</SvgIcon>
            </Button>
        </Tooltip>
    )
}

export default SidebarButton;