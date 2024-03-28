import { memo } from "react";

import { RichTreeView } from "@mui/x-tree-view/RichTreeView";
import { TreeItem } from "@mui/x-tree-view/TreeItem";
import { Stack, SvgIcon, useTheme } from "@mui/material";

import { fileTypeIcons, getFileType } from "../../utils/fileTypes";
import { useTabsContext } from "../../contexts/TabsContext";

const ITEMS = [
    {
        id: "public",
        label: "public",
        children: [
            { id: "favicon.ico", label: "favicon.ico" },
            { id: "index.html", label: "index.html" },
            { id: "logo192.png", label: "logo192.png" },
            { id: "logo512.jpg", label: "logo512.jpg" },
            { id: "manifest.json", label: "manifest.json" },
            { id: "robots.txt", label: "robots.txt" },
        ],
    },
    {
        id: "src",
        label: "src",
        children: [
            {
                id: "assets",
                label: "assets",
                children: [
                    {
                        id: "fonts",
                        label: "fonts",
                        children: [
                            { id: "Montserrat-Black.ttf", label: "Montserrat-Black.ttf" },
                            { id: "Montserrat-Bold.ttf", label: "Montserrat-Bold.ttf" },
                        ],
                    },
                ],
            },
            {
                id: "components",
                label: "components",
                children: [
                    {
                        id: "Editor",
                        label: "Editor",
                        children: [
                            { id: "Editor.jsx", label: "Editor.jsx" },
                            { id: "index1.js", label: "index.js" },
                            { id: "SortableTab.jsx", label: "SortableTab.jsx" },
                            { id: "SortableTabs.jsx", label: "SortableTabs.jsx" },
                        ],
                    },
                    {
                        id: "Sidebars",
                        label: "Sidebars",
                        children: [
                            { id: "index.js", label: "index.js" },
                            { id: "LeftSidebar", label: "LeftSidebar.jsx" },
                            { id: "RightSidebar", label: "RightSidebar.tsx" },
                            { id: "useHorizontalResizing.js", label: "useHorizontalResizing.js" },
                        ],
                    },
                    { id: "Navbar", label: "Navbar.jsx" },
                ],
            },
            {
                id: "themes",
                label: "themes",
                children: [
                    { id: "dark", label: "dark.js" },
                    { id: "light", label: "light.js" },
                    { id: "utils", label: "utils.ts" },
                ],
            },
        ],
    },
    {
        id: "styles",
        label: "styles",
        children: [
            {
                id: "css",
                label: "css",
                children: [
                    { id: "main.css", label: "main.css" },
                    { id: "reset.css", label: "reset.css" },
                    { id: "responsive.css", label: "responsive.css" },
                    { id: "test.css", label: "test.css" }
                ],
            },
        ],
    },
    {
        id: "config",
        label: "config",
        children: [
            { id: "settings.json", label: "settings.json" },
            { id: "config.js", label: "config.js" },
            { id: "constants.js", label: "constants.js" }
        ]
    },
    {
        id: "scripts",
        label: "scripts",
        children: [
            { id: "build.js", label: "build.js" },
            { id: "deploy.sh", label: "deploy.sh" },
            { id: "start.bat", label: "start.bat" }
        ]
    },
];

const ProjectStructureItemLabel = memo(({ id, label, isFolder, addTab }) => {
    const icon = isFolder ? fileTypeIcons.folder : (fileTypeIcons[getFileType(label)] ?? fileTypeIcons.unknown);

    const handleDoubleClick = () => addTab({ id, label });

    return (
        <Stack direction="row" spacing={1} onDoubleClick={!isFolder ? handleDoubleClick : null}>
            <SvgIcon sx={{ width: 18, height: 18 }}>{icon}</SvgIcon>
            <span>{label}</span>
        </Stack>
    )
});

const ProjectStructureItem = ({ itemId, label, children }) => {
    const theme = useTheme();
    const { addTab } = useTabsContext();

    return (
        <TreeItem
            itemId={itemId}
            label={<ProjectStructureItemLabel id={itemId} label={label} isFolder={children?.length} addTab={addTab}/>}
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
                    position: 'relative',
                    '::before': {
                        content: '""',
                        position: 'absolute',
                        width: '1px',
                        height: '100%',
                        borderLeft: `1px solid ${theme.palette.divider}`,
                    },
                },
            }}
        >
            {children}
        </TreeItem>
    );
};

const ProjectStructure = () => {
    return (
        <RichTreeView items={ITEMS} slots={{ item: ProjectStructureItem }} sx={{ flex: 1 }}/>
    );
}

export default ProjectStructure;