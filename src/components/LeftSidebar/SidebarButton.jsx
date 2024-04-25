import { Button, SvgIcon, Tooltip, Zoom } from "@mui/material";

const SidebarButton = ({ title, icon, onClick, isActive }) => {
    return (
        <Tooltip
            title={title}
            placement="right"
            disableInteractive
            TransitionComponent={Zoom}
            slotProps={{
                popper: {
                    modifiers: [{
                        name: 'offset',
                        options: { offset: [0, 9] }
                    }],
                },
                tooltip: {
                    sx: { lineHeight: '18px' }
                }
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
                <SvgIcon sx={{ width: 20, height: 20, }}>{icon}</SvgIcon>
            </Button>
        </Tooltip>
    )
}

export default SidebarButton;