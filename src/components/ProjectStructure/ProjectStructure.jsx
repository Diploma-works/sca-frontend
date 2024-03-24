import { RichTreeView } from "@mui/x-tree-view/RichTreeView";
import { TreeItem } from "@mui/x-tree-view/TreeItem";
import { Stack, useTheme } from "@mui/material";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";

const ITEMS = [
    {
        id: "public",
        label: "public",
        children: [
            { id: "index.html", label: "index.html" },
        ],
    },
    {
        id: "src",
        label: "src",
        children: [
            {
                id: "themes",
                label: "themes",
                children: [
                    { id: "dark", label: "dark.js" },
                    { id: "light", label: "light.js" },
                    { id: "custom", label: "custom.js" }
                ],
            },
            { id: "assets", label: "assets" },
            { id: "components", label: "components" },
            { id: "utils", label: "utils" },
            { id: "helpers", label: "helpers" },
            { id: "constants", label: "constants" }
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
                    { id: "responsive.css", label: "responsive.css" }
                ],
            },
            { id: "scss", label: "scss" },
            { id: "less", label: "less" },
            { id: "stylus", label: "stylus" },
            { id: "postcss", label: "postcss" },
            { id: "sass", label: "sass" }
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
        id: "tests",
        label: "tests",
        children: [
            { id: "unit", label: "unit" },
            { id: "integration", label: "integration" },
            { id: "e2e", label: "e2e" }
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
    {
        id: "docs",
        label: "docs",
        children: [
            { id: "api", label: "api" },
            { id: "guides", label: "guides" },
            { id: "tutorials", label: "tutorials" }
        ]
    },
];

// TODO: Сделать выбор иконки в зависимости от типа файла
const ProjectStructureItemLabel = ({ label, isFolder }) => {
    return (
        <Stack direction="row" alignItems="center" spacing={1}>
            {isFolder ? <FolderOutlinedIcon sx={{ width: 18, height: 18 }}/> :
                <div style={{ width: 18, height: 18, flexShrink: 0 }}/>}
            <span>{label}</span>
        </Stack>
    )
}

const ProjectStructureItem = ({ itemId, label, children }) => {
    const theme = useTheme();

    return (
        <TreeItem
            itemId={itemId}
            label={<ProjectStructureItemLabel label={label} isFolder={children?.length}/>}
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
                        lineHeight: 1.25,
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