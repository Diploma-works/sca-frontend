import { ProjectStructureContextProvider } from "../contexts/ProjectStructureContext";
import PathBreadcrumbs from "./PathBreadcrumbs";
import { Divider, Stack } from "@mui/material";
import LeftSidebar from "./LeftSidebar";
import Editor from "./Editor";
import { TabsContextProvider } from "../contexts/TabsContext";

const defaultTabs = [
    {
        id: "Editor.jsx",
        label: "Editor.jsx",
        path: [
            {
                id: "src",
                label: "src"
            },
            {
                id: "components",
                label: "components"
            },
            {
                id: "Editor",
                label: "Editor"
            }
        ]
    },
    {
        id: "index1.js",
        label: "index.js",
        path: [
            {
                id: "src",
                label: "src"
            },
            {
                id: "components",
                label: "components"
            },
            {
                id: "Editor",
                label: "Editor"
            }
        ]
    },
    {
        id: "utils",
        label: "utils.ts",
        path: [
            {
                id: "src",
                label: "src"
            },
            {
                id: "themes",
                label: "themes"
            }
        ]
    },
    {
        id: "index.html",
        label: "index.html",
        path: [
            {
                id: "public",
                label: "public"
            }
        ]
    },
    {
        id: "logo512.jpg",
        label: "logo512.jpg",
        path: [
            {
                id: "public",
                label: "public"
            }
        ]
    },
    {
        id: "manifest.json",
        label: "manifest.json",
        path: [
            {
                id: "public",
                label: "public"
            }
        ]
    },
    {
        id: "robots.txt",
        label: "robots.txt",
        path: [
            {
                id: "public",
                label: "public"
            }
        ]
    },
    {
        id: "main.css",
        label: "main.css",
        path: [
            {
                id: "styles",
                label: "styles"
            },
            {
                id: "css",
                label: "css"
            }
        ]
    },
];

const Main = () => {
    return (
        <TabsContextProvider tabs={defaultTabs} activeTab={defaultTabs[0]}>
            <ProjectStructureContextProvider>
                <PathBreadcrumbs/>
                <Divider/>
                <Stack direction="row" sx={{ flex: 1, overflow: 'hidden' }}>
                    <LeftSidebar/>
                    <Editor/>
                </Stack>
            </ProjectStructureContextProvider>
        </TabsContextProvider>
    );
}

export default Main;