import { cloneElement, memo } from "react";

import { RichTreeView } from "@mui/x-tree-view/RichTreeView";
import { TreeItem } from "@mui/x-tree-view/TreeItem";
import { Box, Divider, Stack, SvgIcon, useTheme } from "@mui/material";

import { OverlayScrollbarsComponent } from "overlayscrollbars-react";

import { fileTypeIcons, getFileType } from "../../utils/fileTypes";
import { useTabsContext } from "../../contexts/TabsContext";
import ITEMS from "./items";
import { useProjectStructureContext } from "../../contexts/ProjectStructureContext";

const ProjectStructureItemLabel = memo(({ id, label, path, isFolder, addTab }) => {
    const icon = isFolder ? fileTypeIcons.folder : (fileTypeIcons[getFileType(label)] ?? fileTypeIcons.unknown);

    const handleDoubleClick = () => addTab({ id, label, path });

    return (
        <Stack direction="row" spacing={1} onDoubleClick={!isFolder ? handleDoubleClick : null}>
            <SvgIcon sx={{ width: 18, height: 18 }}>{icon}</SvgIcon>
            <span>{label}</span>
        </Stack>
    )
});

const ProjectStructureItem = ({ itemId, label, path, children }) => {
    const theme = useTheme();
    const { addTab } = useTabsContext();

    return (
        <TreeItem
            itemId={itemId}
            label={
                <ProjectStructureItemLabel
                    id={itemId}
                    label={label}
                    path={path}
                    isFolder={children?.length}
                    addTab={addTab}
                />
            }
            sx={{
                '.MuiTreeItem-iconContainer': {
                    color: 'text.disabled',
                },
                '.MuiTreeItem-content': {
                    gap: 6 / 8,
                    borderRadius: 0,
                    userSelect: 'none',
                    '&.Mui-selected, &.Mui-selected.Mui-focused': {
                        bgcolor: 'bg.main',
                        '&:hover': {
                            bgcolor: 'bg.dark',
                        }
                    },
                    '.MuiTreeItem-label': {
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        lineHeight: 'normal',
                        textWrap: 'nowrap',
                    },
                },
                '.MuiTreeItem-groupTransition': {
                    ml: 2,
                    pl: 0,
                    borderLeft: `1px solid ${theme.palette.divider}`,
                },
            }}
        >
            {children?.map((child) => cloneElement(child, {
                slotProps: {
                    item: {
                        path: path ? [...path, { id: itemId, label }] : [{ id: itemId, label }]
                    }
                }
            }))}
        </TreeItem>
    );
};

const ProjectStructure = () => {
    const theme = useTheme();
    const { expandedItems, setExpandedItems, selectedItems, setSelectedItems } = useProjectStructureContext();

    const handleExpandedItemsChange = (e, itemIds) => setExpandedItems(itemIds);
    const handleSelectedItemsChange = (e, itemIds) => setSelectedItems(itemIds);

    return (
        <Stack flex={1} overflow={"hidden"}>
            <Box sx={{
                px: 1.5,
                height: 36,
                display: 'flex',
                alignItems: 'center',
                flexShrink: 0,
                fontWeight: 600,
                fontSize: '0.875rem',
                lineHeight: 'normal',
                textWrap: 'nowrap',
                userSelect: 'none',
            }}>
                Файлы проекта
            </Box>
            <Divider/>
            <OverlayScrollbarsComponent
                options={{
                    scrollbars: {
                        theme: theme.palette.mode === "light" ? "os-theme-dark os-custom" : "os-theme-light os-custom",
                        clickScroll: true,
                    }
                }}
                style={{ flex: 1 }}
            >
                <Box display="flex">
                    <RichTreeView
                        items={ITEMS}
                        selectedItems={selectedItems}
                        expandedItems={expandedItems}
                        slots={{ item: ProjectStructureItem }}
                        sx={{ flex: 1 }}
                        onExpandedItemsChange={handleExpandedItemsChange}
                        onSelectedItemsChange={handleSelectedItemsChange}
                    />
                </Box>
            </OverlayScrollbarsComponent>
        </Stack>
    );
}

export default ProjectStructure;