import { cloneElement, memo, useState } from "react";

import { RichTreeView } from "@mui/x-tree-view/RichTreeView";
import { TreeItem } from "@mui/x-tree-view/TreeItem";
import { useTreeViewApiRef } from "@mui/x-tree-view";
import { Box, Divider, Skeleton, Stack, SvgIcon, useTheme } from "@mui/material";

import ITEMS from "./items";
import { fileTypeIcons, getFileType } from "../../utils/fileTypes";
import { useTabsContext } from "../../contexts/TabsContext";
import { useProjectStructureContext } from "../../contexts/ProjectStructureContext";
import ScrollableContainer from "../ScrollableContainer";

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

    const isLoading = itemId.startsWith("_");

    return (
        <TreeItem
            itemId={itemId}
            label={isLoading ? <Skeleton animation="wave"/> :
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
                        // TODO: убрать это безобразие! нужен только parent id
                        path: path ? [...path, { id: itemId, label }] : [{ id: itemId, label }]
                    }
                }
            }))}
        </TreeItem>
    );
};

const ProjectStructure = () => {
    const [items, setItems] = useState(ITEMS)
    const { expandedItems, setExpandedItems, selectedItems, setSelectedItems } = useProjectStructureContext();
    const treeViewApiRef = useTreeViewApiRef();

    const handleExpandedItemsChange = (e, itemIds) => setExpandedItems(itemIds);
    const handleSelectedItemsChange = (e, itemIds) => setSelectedItems(itemIds);

    // TODO: добавить вызов этой функции при нажатии в PathBreadcrumbs
    const handleItemExpansionToggle = async (event, itemId) => {
        const item = treeViewApiRef.current.getItem(itemId);
        if (item.needsLoading) {
            item.needsLoading = false;
            item.children = await fetchChildren(itemId);
            setItems([...items]);
        }
    }

    const fetchChildren = (itemId) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve([
                    { id: "favicon.ico", label: "favicon.ico" },
                    { id: "index.html", label: "index.html" },
                    { id: "logo192.png", label: "logo192.png" },
                    { id: "logo512.jpg", label: "logo512.jpg" },
                    { id: "manifest.json", label: "manifest.json" },
                    { id: "robots.txt", label: "robots.txt" },
                ]);
            }, 1000);
        });
    }

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
            <ScrollableContainer style={{ flex: 1 }}>
                <Box display="flex">
                    <RichTreeView
                        apiRef={treeViewApiRef}
                        items={items}
                        selectedItems={selectedItems}
                        expandedItems={expandedItems}
                        slots={{ item: ProjectStructureItem }}
                        sx={{ flex: 1 }}
                        onExpandedItemsChange={handleExpandedItemsChange}
                        onSelectedItemsChange={handleSelectedItemsChange}
                        onItemExpansionToggle={handleItemExpansionToggle}
                    />
                </Box>
            </ScrollableContainer>
        </Stack>
    );
}

export default ProjectStructure;