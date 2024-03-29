import { Button, Divider, Tooltip, Zoom } from "@mui/material";

const SidebarButton = ({ title, icon, onClick, renderDivider, isActive }) => {
    return (
        <>
            <Tooltip
                title={title}
                placement="right"
                disableInteractive
                enterDelay={300}
                TransitionComponent={Zoom}
                slotProps={{
                    popper: {
                        modifiers: [{
                            name: 'offset',
                            options: { offset: [0, -5] },
                        }],
                    },
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
                    {icon}
                </Button>
            </Tooltip>
            {renderDivider && <Divider flexItem/>}
        </>
    )
}

export default SidebarButton;