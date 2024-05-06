import { cloneElement, useCallback, useState } from "react";

import { Stack, useTheme } from "@mui/material";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import QueryStatsRoundedIcon from "@mui/icons-material/QueryStatsRounded";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";

import { useSidebarContext } from "../../contexts/SidebarContext";
import SidebarButton from "./SidebarButton";
import HorizontallyResizableBox from "./HorizontallyResizableBox";
import ProjectStructure from "../ProjectStructure";
import SidebarTool from "./SidebarTool";
import Problems from "../Problems";
import useWindowSize from "./useWindowSize";

const tools = [
    {
        title: "Файлы проекта",
        icon: <FolderOutlinedIcon/>,
        component: <ProjectStructure/>
    },
    {
        title: "Статистика",
        icon: <QueryStatsRoundedIcon/>,
        component: <SidebarTool><div style={{ width: 187, height: 1 }}></div></SidebarTool>
    },
    {
        title: "Проблемы",
        icon: <ErrorOutlineRoundedIcon/>,
        component: <Problems/>
    },
];

const MIN_WIDTH = 36;

const LeftSidebar = () => {
    const theme = useTheme();

    const [activeTool, setActiveTool] = useSidebarContext();

    const { innerWidth } = useWindowSize();
    const [prevWidths, setPrevWidths] = useState(Array(tools.length));
    const [disableResizing, setDisableResizing] = useState(true);

    const handleClick = (value) => {
        setActiveTool((prevValue) => prevValue === value ? null : value);
    };

    const updatePrevWidth = useCallback((newWidth) => {
        const updatedPrevWidths = [...prevWidths];
        updatedPrevWidths[activeTool] = newWidth;
        setPrevWidths(updatedPrevWidths);
    }, [prevWidths, activeTool]);

    return (
        <>
            <Stack
                spacing={4 / 8}
                alignItems="center"
                sx={{
                    p: 4 / 8,
                    bgcolor: 'background.paper',
                    borderRadius: 1,
                    alignSelf: 'flex-start',
                }}
            >
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
            {activeTool !== null && (
                <HorizontallyResizableBox
                    key={activeTool} // TODO: поискать другое решение?
                    sx={{
                        display: 'flex',
                        minWidth: MIN_WIDTH,
                        maxWidth: {
                            xs: innerWidth - MIN_WIDTH - 3 * parseInt(theme.spacing(4 / 8)),
                            md: innerWidth - MIN_WIDTH - 3 * parseInt(theme.spacing(1)),
                        },
                    }}
                    prevWidth={prevWidths[activeTool]}
                    updatePrevWidth={updatePrevWidth}
                    disable={disableResizing}
                >
                    {cloneElement(tools[activeTool].component, {
                        title: tools[activeTool].title,
                        disableResizing,
                        setDisableResizing
                    })}
                </HorizontallyResizableBox>
            )}
        </>
    );
}

export default LeftSidebar;