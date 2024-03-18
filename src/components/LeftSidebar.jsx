import { useCallback, useEffect, useRef, useState } from "react";

import { Box, Button, Divider, Stack, Tooltip } from "@mui/material";
import Zoom from "@mui/material/Zoom";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import QueryStatsRoundedIcon from "@mui/icons-material/QueryStatsRounded";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";

const buttons = [
    { title: "Файлы проекта", icon: <FolderOutlinedIcon/>, component: <div style={{ width: 1870, height: 1 }}></div> },
    { title: "Статистика", icon: <QueryStatsRoundedIcon/>, component: <div style={{ width: 187, height: 1 }}></div> },
    { title: "Проблемы", icon: <ErrorOutlineRoundedIcon/>, component: <div style={{ width: 500, height: 1 }}></div> },
];

const SidebarButton = ({ title, icon, onClick, renderDivider, isActive, }) => {
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

const InteractiveDivider = ({ activationArea, ...props }) => {
    return (
        <Divider orientation="vertical"
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
}

const ResizeableBox = ({ minWidth, maxWidth, initialWidth, updateInitialWidth, children }) => {
    const [isResizing, setIsResizing] = useState(false);
    const [width, setWidth] = useState(initialWidth ?? window.innerWidth - 52 - minWidth);
    const [startPos, setStartPos] = useState({ x: 0, width: 0 });

    const boxRef = useRef(null);

    const handleMouseDown = (e) => {
        e.preventDefault();
        setIsResizing(true);
        setStartPos({ x: e.clientX, width: boxRef.current.offsetWidth });
    }

    const handleMouseMove = useCallback(({ clientX }) => {
        if (!isResizing) {
            return;
        }
        const newWidth = startPos.width + clientX - startPos.x;
        if (newWidth >= minWidth && newWidth <= window.innerWidth - 52 - minWidth) {
            setWidth(newWidth);
            updateInitialWidth(newWidth);
        }
    }, [isResizing, minWidth, startPos, updateInitialWidth]);

    const handleMouseUp = () => {
        setIsResizing(false);
    }

    const handleTouchStart = (e) => {
        e.preventDefault();
        setIsResizing(true);
        setStartPos({ x: e.touches[0].clientX, width: boxRef.current.offsetWidth });
    }

    const handleTouchMove = useCallback((e) => {
        e.preventDefault();
        handleMouseMove(e.touches[0]);
    }, [handleMouseMove]);

    const handleResize = useCallback(() => {
        setWidth((prevMaxWidth) => Math.min(prevMaxWidth, window.innerWidth - 52 - minWidth));
    }, [minWidth]);

    useEffect(() => {
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [handleResize]);

    useEffect(() => {
        if (isResizing) {
            window.addEventListener("mousemove", handleMouseMove);
            window.addEventListener("touchmove", handleTouchMove);
            window.addEventListener("mouseup", handleMouseUp);
            window.addEventListener("touchend", handleMouseUp);
            document.body.style.cursor = "ew-resize";
        }

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("touchmove", handleTouchMove);
            window.removeEventListener("mouseup", handleMouseUp);
            window.removeEventListener("touchend", handleMouseUp);
            document.body.style.cursor = "auto";
        }
    }, [isResizing, handleMouseMove, handleTouchMove])

    return (
        <>
            <Box ref={boxRef} sx={{
                overflow: 'auto',
                maxWidth: width,
            }}>
                {children}
            </Box>
            <InteractiveDivider
                activationArea={5} // TODO: подумать о том, как увеличить это значение на телефоне (и стоит ли)
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
            />
        </>
    )
}

const MIN_WIDTH = 40;
const BTN_WIDTH = 52;

const LeftSidebar = () => {
    const [activeValue, setActiveValue] = useState(null);
    const [prevWidths, setPrevWidths] = useState(Array(buttons.length));

    const handleClick = (value) => {
        setActiveValue((prevValue) => prevValue === value ? null : value);
    };

    const updatePrevWidth = (newWidth) => {
        const updatedPrevWidths = [...prevWidths];
        updatedPrevWidths[activeValue] = newWidth;
        setPrevWidths(updatedPrevWidths);
    }

    return (
        <>
            <Stack spacing={1} alignItems="center" sx={{ p: 1 }}>
                {buttons.map((button, index) => (
                    <SidebarButton
                        key={index}
                        title={button.title}
                        icon={button.icon}
                        onClick={() => handleClick(index)}
                        renderDivider={index !== buttons.length - 1}
                        isActive={activeValue === index}
                    />
                ))}
            </Stack>
            <Divider orientation="vertical"/>
            {activeValue !== null &&
                <ResizeableBox
                    key={activeValue}
                    minWidth={MIN_WIDTH}
                    initialWidth={prevWidths[activeValue]}
                    updateInitialWidth={updatePrevWidth}
                >
                    {buttons[activeValue]?.title}
                    {buttons[activeValue]?.component}
                </ResizeableBox>
            }
        </>
    );
}

export default LeftSidebar;