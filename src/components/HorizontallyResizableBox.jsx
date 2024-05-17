import { Box, Divider, Stack, useTheme } from "@mui/material";
import useHorizontalResizing from "../hooks/useHorizontalResizing";

const InteractiveVerticalDivider = ({ isResizing, ...props }) => {
    const theme = useTheme();

    return (
        <Divider
            flexItem
            orientation="vertical"
            sx={{
                position: 'relative',
                my: 4 / 8,
                left: {
                    xs: theme.spacing(2 / 8),
                    md: theme.spacing(4 / 8)
                },
                cursor: 'ew-resize',
                touchAction: 'none',
                overflow: 'visible',
                '::before': { right: 0 },
                '::after': { left: 1 },
                '::before, ::after': {
                    position: 'absolute',
                    // TODO: убрать этот "хак" с увеличением ширины (сделать что-то с pointerEvents соседей?)
                    width: isResizing ? 100 : {
                        xs: theme.spacing(1),
                        md: theme.spacing(4 / 8)
                    },
                    height: '100%',
                    zIndex: '3',
                    content: '""',
                },
                borderColor: isResizing ? 'action.active' : 'background.default',
                '@media (hover: hover)': {
                    ':hover': {
                        borderColor: isResizing ? 'action.active' : 'bg.main',
                    },
                },
            }}
            {...props}
        />
    );
}

const HorizontallyResizableBox = ({ sx, prevWidth, updatePrevWidth, disable, children }) => {
    const { width, listeners, isResizing, resizableElementRef } = useHorizontalResizing(prevWidth, updatePrevWidth);

    return (
        <Stack direction={"row"}>
            <Box
                ref={resizableElementRef}
                sx={{
                    ...sx,
                    ...(!disable && {
                        width: width + 'px',
                    })
                }}
            >
                {children}
            </Box>
            {!disable && <InteractiveVerticalDivider isResizing={isResizing} {...listeners}/>}
        </Stack>
    )
}

export default HorizontallyResizableBox;