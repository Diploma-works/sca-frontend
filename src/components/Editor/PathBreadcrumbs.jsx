import { useCallback, useMemo } from "react";

import { Breadcrumbs, Button, SvgIcon } from "@mui/material";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";

import { useTabsStateContext } from "./TabsContext";
import { useSidebarUpdateContext } from "../LeftSidebar";
import { useProjectStructureContext } from "../ProjectStructure";
import { fileTypeIcons, getFileType } from "../../utils/fileTypes";

const PathBreadcrumbs = () => {
    const setActiveTool = useSidebarUpdateContext();
    const { activeTab } = useTabsStateContext();
    const { expandedItems, setExpandedItems, setSelectedItems } = useProjectStructureContext();

    const handleClick = useCallback((index, pathElements) => {
        const itemsToExpand = pathElements.slice(0, index === pathElements.length - 1 ? index : index + 1)
            .map((pathElement) => pathElement.id);
        setActiveTool(0);
        setExpandedItems([...new Set([...expandedItems, ...itemsToExpand])]);
        setSelectedItems(pathElements[index].id);
    }, [expandedItems, setActiveTool, setExpandedItems, setSelectedItems]);

    const children = useMemo(() => activeTab && [...activeTab.path, activeTab].map((pathElement, index, pathElements) =>
        <Button
            key={index}
            color="inherit"
            sx={{
                px: 4 / 8,
                py: 2 / 8,
                gap: 4 / 8,
                minWidth: 0,
                fontSize: 'small',
            }}
            onClick={() => handleClick(index, pathElements)}
        >
            {index === pathElements.length - 1 && (
                <SvgIcon sx={{ width: 16, height: 16 }}>
                    {fileTypeIcons[getFileType(pathElement.label)] ?? fileTypeIcons.unknown}
                </SvgIcon>
            )}
            {pathElement.label}
        </Button>
    ), [activeTab, handleClick]);

    return (
        <Breadcrumbs
            separator={<NavigateNextIcon sx={{ width: 16, height: 16 }}/>}
            sx={{
                p: 4 / 8,
                lineHeight: 0,
                '.MuiBreadcrumbs-ol': {
                    rowGap: 4 / 8,
                },
                '.MuiBreadcrumbs-separator': {
                    mx: 0,
                },
            }}
        >
            {children}
        </Breadcrumbs>
    );
}

export default PathBreadcrumbs;