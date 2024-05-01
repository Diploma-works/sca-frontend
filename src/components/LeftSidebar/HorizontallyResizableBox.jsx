import { Box, Divider } from "@mui/material";
import useHorizontalResizing from "./useHorizontalResizing";

const InteractiveVerticalDivider = ({ activationArea, ...props }) => {
    return (
        <Divider
            orientation="vertical"
            sx={{
                position: 'relative',
                cursor: 'ew-resize',
                touchAction: 'none',
                overflow: 'visible',
                '::before, ::after': {
                    position: 'absolute',
                    top: 0,
                    width: activationArea,
                    height: '100%',
                    zIndex: 1000,
                    content: '""',
                },
                '::before': { left: -activationArea, },
                '::after': { right: -activationArea - 1, },
            }}
            {...props}
        />
    );
}

const HorizontallyResizableBox = ({ sx, getMinWidth, getMaxWidth, prevWidth, updatePrevWidth, disable, children }) => {
    const {
        width,
        listeners,
        resizableElementRef
    } = useHorizontalResizing(getMinWidth, getMaxWidth, prevWidth, updatePrevWidth);

    return (
        <>
            <Box
                ref={resizableElementRef}
                sx={{
                    ...sx,
                    ...(!disable && {
                        width,
                        minWidth: getMinWidth(),
                        maxWidth: getMaxWidth(),
                    })
                }}
            >
                {children}
            </Box>
            {disable ? (
                <Divider orientation="vertical"/>
            ) : (
                <InteractiveVerticalDivider activationArea={3} {...listeners}/>
            )}
        </>
    )
}

export default HorizontallyResizableBox;