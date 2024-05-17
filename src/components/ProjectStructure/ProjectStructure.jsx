import { cloneElement, memo, useState } from "react";

import { RichTreeView } from "@mui/x-tree-view/RichTreeView";
import { TreeItem } from "@mui/x-tree-view/TreeItem";
import { useTreeViewApiRef } from "@mui/x-tree-view";
import { Box, Skeleton, Stack, SvgIcon, useTheme } from "@mui/material";

import KeyboardArrowRightRoundedIcon from "@mui/icons-material/KeyboardArrowRightRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import UnfoldLessRoundedIcon from "@mui/icons-material/UnfoldLessRounded";
import UnfoldMoreRoundedIcon from "@mui/icons-material/UnfoldMoreRounded";

import ITEMS from "./items";
import { SidebarTool } from "../LeftSidebar/";
import { useTabsContext } from "../Editor";
import { useProjectStructureContext } from "./ProjectStructureContext";
import { fileTypeIcons, getFileType } from "../../utils/fileTypes";
import ScrollableContainer from "../ScrollableContainer";

// TODO: упростить (пока нельзя, потому что path собирается здесь)
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
                    color: 'text.secondary',
                },
                '.MuiTreeItem-content': {
                    gap: 1,
                    borderRadius: 0,
                    userSelect: 'none',
                    '&.Mui-selected, &.Mui-selected.Mui-focused': {
                        bgcolor: 'bg.main',
                        '&:hover': {
                            bgcolor: 'bg.dark',
                        }
                    },
                    '.MuiTreeItem-label': {
                        ...theme.typography.button,
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

const ProjectStructure = memo(({ title, disableResizing, setDisableResizing }) => {
    const [items, setItems] = useState(ITEMS)
    const { expandedItems, setExpandedItems, selectedItems, setSelectedItems } = useProjectStructureContext();
    const treeViewApiRef = useTreeViewApiRef();

    // TODO: добавить полноценные функции
    const additionalActions = [
        {
            title: "Развернуть все",
            icon: <UnfoldMoreRoundedIcon/>,
            props: {
                onClick: () => console.log(treeViewApiRef.current)
            }
        },
        {
            title: "Свернуть все",
            icon: <UnfoldLessRoundedIcon/>,
            props: {
                onClick: () => console.log(treeViewApiRef.current)
            }
        }
    ];

    // TODO: обернуть в useCallback?
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
        <SidebarTool
            title={title}
            additionalActions={additionalActions}
            disableResizing={disableResizing}
            setDisableResizing={setDisableResizing}
        >
            <ScrollableContainer style={{ flex: 1 }}>
                <Box display="flex">
                    <RichTreeView
                        apiRef={treeViewApiRef}
                        items={items}
                        selectedItems={selectedItems}
                        expandedItems={expandedItems}
                        slots={{
                            item: ProjectStructureItem,
                            expandIcon: KeyboardArrowRightRoundedIcon,
                            collapseIcon: KeyboardArrowDownRoundedIcon
                        }}
                        sx={{ flex: 1 }}
                        onExpandedItemsChange={handleExpandedItemsChange}
                        onSelectedItemsChange={handleSelectedItemsChange}
                        onItemExpansionToggle={handleItemExpansionToggle}
                    />
                </Box>
            </ScrollableContainer>
        </SidebarTool>
    );
});

export default ProjectStructure;