import { forwardRef } from "react";
import { Box, Divider } from "@mui/material";
import useHorizontalResizing from "./useHorizontalResizing";

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
    )
})

const HorizontallyResizableBox = ({
                                      sx,
                                      getMinWidth,
                                      getMaxWidth,
                                      prevWidth,
                                      updatePrevWidth,
                                      dividerPosition,
                                      children,
                                  }) => {
    const {
        width,
        resizableElementRef,
        resizeHandleRef
    } = useHorizontalResizing(getMinWidth, getMaxWidth, prevWidth, updatePrevWidth);

    return (
        <>
            {dividerPosition === "before" && <InteractiveVerticalDivider ref={resizeHandleRef} activationArea={3}/>}
            <Box ref={resizableElementRef} sx={{
                ...sx,
                width: width ?? 'auto',
                minWidth: getMinWidth(),
                maxWidth: getMaxWidth(),
            }}>
                {children}
            </Box>
            {dividerPosition === "after" && <InteractiveVerticalDivider ref={resizeHandleRef} activationArea={3}/>}
        </>
    )
}

export default HorizontallyResizableBox;