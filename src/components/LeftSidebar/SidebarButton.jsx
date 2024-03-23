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
                            options: {
                                offset: [0, 3],
                            },
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
                        minWidth: 0,
                        p: 6 / 8,
                        color: 'text.disabled',
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