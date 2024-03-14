import { Box, Button, Divider, Stack, useTheme } from "@mui/material";
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import QueryStatsRoundedIcon from '@mui/icons-material/QueryStatsRounded';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import { useEffect, useRef, useState } from "react";

const buttons = [
    { label: "Файлы проекта", icon: <FolderOutlinedIcon sx={{ color: 'text.disabled' }}/> },
    { label: "Статистика", icon: <QueryStatsRoundedIcon sx={{ color: 'text.disabled' }}/> },
    { label: "Проблемы", icon: <ErrorOutlineRoundedIcon sx={{ color: 'text.disabled' }}/> },
];

const SidebarButton = ({ value, label, icon, divider, active, onChange }) => {
    const theme = useTheme();

    // TODO: tooltip
    return (
        <>
            <Button
                variant={active ? "contained" : "text"}
                disableElevation
                color="inherit"
                sx={{
                    //bgcolor: 'action.focus',
                    minWidth: 0,
                    p: 6 / 8,
                }}
                onClick={() => onChange(value)}
            >
                {icon}
            </Button>
            {divider && <Divider flexItem/>}
        </>
    )
}

const LeftSidebar = () => {
    const theme = useTheme();

    const [maxWidth, setMaxWidth] = useState(null);
    const [isResizing, setIsResizing] = useState(false);
    const [startPos, setStartPos] = useState({ x: 0, width: 0 });

    const [activeValue, setActiveValue] = useState(null);

    const boxRef = useRef(null);

    const onChange = (value) => {
        setMaxWidth((window.innerWidth) / 2);
        setActiveValue((prev) => prev === value ? null : value);
    };

    const handleMouseDown = (e) => {
        e.preventDefault();
        setIsResizing(true);
        setStartPos({ x: e.clientX, width: boxRef.current.offsetWidth });
        console.log(boxRef.current);
    }

    const handleMouseMove = (e) => {
        if (!isResizing) {
            return;
        }
        const newWidth = startPos.width + e.clientX - startPos.x;
        if (newWidth >= 20 && newWidth <= (window.innerWidth - boxRef.current.offsetLeft)) {
            setMaxWidth(newWidth); // TODO: подумать над максимальной шириной
        }
    }

    const handleMouseUp = () => {
        setIsResizing(false);
    }

    const handleTouchStart = (e) => {
        e.preventDefault();
        setIsResizing(true);
        setStartPos({ x: e.touches[0].clientX, width: boxRef.current.offsetWidth });
    };

    const handleTouchMove = (e) => {
        if (!isResizing) {
            return;
        }
        const newWidth = startPos.width + e.touches[0].clientX - startPos.x;
        if (newWidth >= 100) {
            setMaxWidth(newWidth); // TODO: возможно, есть смысл ограничить размером окна
        }
    };

    useEffect(() => {
        if (isResizing) {
            window.addEventListener("mousemove", handleMouseMove);
            window.addEventListener("mouseup", handleMouseUp);
            window.addEventListener("touchmove", handleTouchMove);
            window.addEventListener("touchend", handleMouseUp);
            document.body.style.cursor = "ew-resize";
        }

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
            window.removeEventListener("touchmove", handleTouchMove);
            window.removeEventListener("touchend", handleMouseUp);
            document.body.style.cursor = "auto";
        }
    }, [isResizing, handleMouseMove, handleTouchMove])

    return (
        <>
            <Stack spacing={1} alignItems="center" sx={{
                p: 1,
                //bgcolor: 'white',
            }}>
                {buttons.map((button, index) => (
                    <SidebarButton
                        value={index}
                        key={index}
                        label={button.label}
                        icon={button.icon}
                        divider={index !== buttons.length - 1}
                        active={activeValue === index}
                        onChange={onChange}
                    />
                ))}
            </Stack>
            <Divider orientation="vertical"/>
            {activeValue !== null &&
                <>
                    <Box ref={boxRef} sx={{
                        overflow: 'auto',
                        maxWidth: maxWidth,
                    }}>
                        {buttons[activeValue]?.label}
                        <div style={{ width: 1870, height: 1920 }}></div>
                    </Box>
                    <Divider orientation="vertical"
                             sx={{
                                 position: 'relative',
                                 cursor: 'ew-resize',
                                 overflow: 'visible',
                                 '::before, ::after': {
                                     zIndex: 1000,
                                     content: '""',
                                     position: 'absolute',
                                     top: 0,
                                     width: '5px',
                                     height: '100%',
                                 },
                                 '::before': { left: '-5px', },
                                 '::after': { right: '-6px', },
                             }}
                             onMouseDown={handleMouseDown}
                             onTouchStart={handleTouchStart}
                    />
                </>
            }
        </>
    );
}

export default LeftSidebar;