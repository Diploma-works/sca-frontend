const ITEMS = [
    {
        id: "public",
        label: "public",
        needsLoading: true,
        children: [
            { id: "_public", label: "Загрузка..." },
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

export default ITEMS;