import { useCallback, useState } from "react";

import { Divider, Stack } from "@mui/material";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import QueryStatsRoundedIcon from "@mui/icons-material/QueryStatsRounded";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";

import SidebarButton from "./SidebarButton";
import HorizontallyResizableBox from "./HorizontallyResizableBox";
import ProjectStructure from "../ProjectStructure";

// TODO: может есть смысл добавить размер иконок через cloneElement?
const buttons = [
    {
        title: "Файлы проекта",
        icon: <FolderOutlinedIcon sx={{ width: 20, height: 20, }}/>,
        component: <ProjectStructure/>
    },
    {
        title: "Статистика",
        icon: <QueryStatsRoundedIcon sx={{ width: 20, height: 20, }}/>,
        component: <div style={{ width: 187, height: 1 }}></div>
    },
    {
        title: "Проблемы",
        icon: <ErrorOutlineRoundedIcon sx={{ width: 20, height: 20, }}/>,
        component: <div style={{ width: 500, height: 1 }}></div>
    },
];

const MIN_WIDTH = 40;
const BTN_WIDTH = 52;

const LeftSidebar = () => {
    const [activeValue, setActiveValue] = useState(null);
    const [prevWidths, setPrevWidths] = useState(Array(buttons.length));

    const handleClick = (value) => {
        setActiveValue((prevValue) => prevValue === value ? null : value);
    };

    const updatePrevWidth = useCallback((newWidth) => {
        const updatedPrevWidths = [...prevWidths];
        updatedPrevWidths[activeValue] = newWidth;
        setPrevWidths(updatedPrevWidths);
    }, [prevWidths, activeValue]);

    return (
        <>
            <Stack spacing={4 / 8} alignItems="center" sx={{ p: 4 / 8 }}>
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
                <HorizontallyResizableBox
                    key={activeValue}
                    getMinWidth={() => MIN_WIDTH}
                    getMaxWidth={() => window.innerWidth - MIN_WIDTH - BTN_WIDTH}
                    prevWidth={prevWidths[activeValue]}
                    updatePrevWidth={updatePrevWidth}
                    dividerPosition="after"
                >
                    {buttons[activeValue]?.component}
                </HorizontallyResizableBox>
            }
        </>
    );
}

export default LeftSidebar;