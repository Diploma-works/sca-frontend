import { useCallback, useState } from "react";

import { Divider, Stack } from "@mui/material";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import QueryStatsRoundedIcon from "@mui/icons-material/QueryStatsRounded";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";

import SidebarButton from "./SidebarButton";
import HorizontallyResizableBox from "./HorizontallyResizableBox";
import ProjectStructure from "../ProjectStructure";
import { useSidebarContext } from "../../contexts/SidebarContext";

const tools = [
    {
        title: "Файлы проекта",
        icon: <FolderOutlinedIcon/>,
        component: <ProjectStructure/>
    },
    {
        title: "Статистика",
        icon: <QueryStatsRoundedIcon/>,
        component: <div style={{ width: 187, height: 1 }}></div>
    },
    {
        title: "Проблемы",
        icon: <ErrorOutlineRoundedIcon/>,
        component: <div style={{ width: 500, height: 1 }}></div>
    },
];

const MIN_WIDTH = 36;

const LeftSidebar = () => {
    const [activeTool, setActiveTool] = useSidebarContext();
    const [prevWidths, setPrevWidths] = useState(Array(tools.length));

    const handleClick = (value) => {
        setActiveTool((prevValue) => prevValue === value ? null : value);
    };

    const getMinWidth = useCallback(() => MIN_WIDTH, []);
    const getMaxWidth = useCallback(() => window.innerWidth - MIN_WIDTH * 2 - 2, []);

    const updatePrevWidth = useCallback((newWidth) => {
        const updatedPrevWidths = [...prevWidths];
        updatedPrevWidths[activeTool] = newWidth;
        setPrevWidths(updatedPrevWidths);
    }, [prevWidths, activeTool]);

    return (
        <>
            <Stack spacing={4 / 8} alignItems="center" sx={{ p: 4 / 8 }} divider={<Divider flexItem/>}>
                {tools.map((tool, index) => (
                    <SidebarButton
                        key={index}
                        title={tool.title}
                        icon={tool.icon}
                        onClick={() => handleClick(index)}
                        isActive={activeTool === index}
                    />
                ))}
            </Stack>
            <Divider orientation="vertical"/>
            {activeTool !== null &&
                <HorizontallyResizableBox
                    key={activeTool}
                    sx={{ display: 'flex' }}
                    getMinWidth={getMinWidth}
                    getMaxWidth={getMaxWidth}
                    prevWidth={prevWidths[activeTool]}
                    updatePrevWidth={updatePrevWidth}
                    dividerPosition="after"
                >
                    {tools[activeTool]?.component}
                </HorizontallyResizableBox>
            }
        </>
    );
}

export default LeftSidebar;