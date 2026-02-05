import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { Skeleton, Stack } from "@mui/material";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import QueryStatsRoundedIcon from "@mui/icons-material/QueryStatsRounded";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import GitHubIcon from "@mui/icons-material/GitHub";

import { Editor, TabsContextProvider } from "./Editor";
import { Problems, ProblemsContextProvider } from "./Problems";
import { LeftSidebar, SidebarContextProvider } from "./LeftSidebar";
import { ProjectStructure, ProjectStructureContextProvider } from "./ProjectStructure";
import { Statistics } from "./Statistics";
import { Git } from "./Git";

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
    const { id: projectId } = useParams();
    const [isLoading, setIsLoading] = useState(true); // TODO: заменить?

    const tools = [
        {
            title: "Файлы проекта",
            icon: <FolderOutlinedIcon/>,
            component: <ProjectStructure projectId={projectId} />
        },
        {
            title: "GitHub",
            icon: <GitHubIcon/>,
            component: <Git projectId={projectId} />
        },
        {
            title: "Статистика",
            icon: <QueryStatsRoundedIcon/>,
            component: <Statistics/>
        },
        {
            title: "Проблемы",
            icon: <ErrorOutlineRoundedIcon/>,
            component: <Problems/>
        },
    ];

    useEffect(() => {
        setTimeout(() => setIsLoading(false), 1000);
    }, []);

    return (
        <TabsContextProvider>
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
                                    <LeftSidebar tools={tools}/>
                                    <Editor projectId={projectId}/>
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