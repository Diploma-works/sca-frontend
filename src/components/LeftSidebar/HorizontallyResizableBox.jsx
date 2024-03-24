import { forwardRef } from "react";
import { Box, Divider } from "@mui/material";
import useHorizontalResizing from "./useHorizontalResizing";

const InteractiveDivider = forwardRef(({ activationArea, ...props }, ref) => {
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
                                      getMinWidth,
                                      getMaxWidth,
                                      prevWidth,
                                      updatePrevWidth,
                                      dividerPosition,
                                      children
                                  }) => {
    const {
        width,
        resizeableElementRef,
        resizeHandleRef
    } = useHorizontalResizing(getMinWidth, getMaxWidth, prevWidth, updatePrevWidth);

    return (
        <>
            {dividerPosition === "before" && <InteractiveDivider ref={resizeHandleRef} activationArea={5}/>}
            <Box ref={resizeableElementRef} sx={{
                display: 'flex',
                overflow: 'auto',
                width: width ?? 'auto',
                minWidth: getMinWidth(),
                maxWidth: getMaxWidth(),
            }}>
                {children}
            </Box>
            {dividerPosition === "after" && <InteractiveDivider ref={resizeHandleRef} activationArea={5}/>}
        </>
    )
}

export default HorizontallyResizableBox;