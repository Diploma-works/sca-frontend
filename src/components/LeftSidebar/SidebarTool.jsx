import { forwardRef } from "react";

import { Box, Button, Divider, Stack, Typography } from "@mui/material";
import RemoveRoundedIcon from "@mui/icons-material/RemoveRounded";

import { useSidebarUpdateContext } from "../../contexts/SidebarContext";
import useHorizontalResizing from "./useHorizontalResizing";
import ScrollableContainer from "../ScrollableContainer";

const InteractiveVerticalDivider = forwardRef(({ activationArea, ...props }, ref) => {
    return (
        <Divider ref={ref}
                 orientation="vertical"
                 sx={{
                     position: 'relative',
                     cursor: 'ew-resize',
                     touchAction: 'none',
                     overflow: 'visible',
                     '::before, ::after': {
                         zIndex: 1000,
                         content: '""',
                         position: 'absolute',
                         top: 0,
                         width: activationArea,
                         height: '100%',
                     },
                     '::before': { left: -activationArea, },
                     '::after': { right: -activationArea - 1, },
                 }}
                 {...props}
        />
    );
});

const SidebarTool = ({ title, getMinWidth, getMaxWidth, prevWidth, updatePrevWidth, children }) => {
    const {
        width,
        resizableElementRef,
        resizeHandleRef
    } = useHorizontalResizing(getMinWidth, getMaxWidth, prevWidth, updatePrevWidth);

    const setActiveTool = useSidebarUpdateContext();

    const handleClick = () => setActiveTool(null);

    return (
        <>
            <Stack
                ref={resizableElementRef}
                divider={<Divider/>}
                sx={{
                    width,
                    minWidth: getMinWidth(),
                    maxWidth: getMaxWidth(),
                    overflow: 'hidden',
                }}
            >
                <Box sx={{
                    position: 'relative',
                    pl: 1.5,
                    height: 36,
                    display: 'flex',
                    alignItems: 'center',
                }}>
                    <Typography
                        variant={"button"}
                        sx={{
                            fontWeight: 600,
                            lineHeight: 'normal',
                            textWrap: 'nowrap',
                            textTransform: 'none',
                        }}
                    >
                        {title}
                    </Typography>
                    <Stack
                        direction="row"
                        spacing={1}
                        sx={{
                            position: 'absolute',
                            p: 1,
                            right: 0,
                            color: 'text.secondary',
                            bgcolor: 'background.default',
                        }}
                    >
                        <Button
                            color="inherit"
                            disableElevation
                            onClick={handleClick}
                            sx={{
                                p: 0,
                                minWidth: 0,
                            }}
                        >
                            <RemoveRoundedIcon sx={{ width: 20, height: 20 }}/>
                        </Button>
                    </Stack>
                </Box>
                <ScrollableContainer style={{ flex: 1 }}>
                    <Box display="flex">
                        {children}
                    </Box>
                </ScrollableContainer>
            </Stack>
            <InteractiveVerticalDivider ref={resizeHandleRef} activationArea={3}/>
        </>
    );
}

export default SidebarTool;