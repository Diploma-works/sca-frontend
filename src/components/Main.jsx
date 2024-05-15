import { Skeleton, Stack } from "@mui/material";

import Editor from "./Editor";
import LeftSidebar from "./LeftSidebar";

import { TabsContextProvider } from "../contexts/TabsContext";
import { SidebarContextProvider } from "../contexts/SidebarContext";
import { ProblemsContextProvider } from "../contexts/ProblemsContext";
import { ProjectStructureContextProvider } from "../contexts/ProjectStructureContext";
import { useEffect, useState } from "react";

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
    const [isLoading, setIsLoading] = useState(true); // TODO: заменить?

    useEffect(() => {
        setTimeout(() => setIsLoading(false), 1000);
    }, []);

    return (
        <TabsContextProvider tabs={defaultTabs} activeTab={defaultTabs[0]}>
            <SidebarContextProvider>
                <ProjectStructureContextProvider>
                    <ProblemsContextProvider>
                        <Stack
                            direction="row"
                            spacing={{ xs: 4 / 8, md: 1 }}
                            sx={{
                                flex: 1,
                                overflow: 'hidden',
                                p: { xs: 4 / 8, md: 1 },
                            }}
                        >
                            {isLoading ? (
                                <>
                                    <Skeleton animation="wave" sx={{ width: 36, height: 100, transform: 'none' }}/>
                                    <Skeleton animation="wave" sx={{ flex: 1, transform: 'none' }}/>
                                </>
                            ) : (
                                <>
                                    <LeftSidebar/>
                                    <Editor/>
                                </>
                            )}
                        </Stack>
                    </ProblemsContextProvider>
                </ProjectStructureContextProvider>
            </SidebarContextProvider>
        </TabsContextProvider>
    );
}

export default Main;