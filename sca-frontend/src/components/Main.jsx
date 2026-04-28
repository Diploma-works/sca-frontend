import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { Skeleton, Stack, SvgIcon } from "@mui/material";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import QueryStatsRoundedIcon from "@mui/icons-material/QueryStatsRounded";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";

import { Editor, TabsContextProvider } from "./Editor";
import { Problems, ProblemsContextProvider } from "./Problems";
import { LeftSidebar, SidebarContextProvider } from "./LeftSidebar";
import { ProjectStructure, ProjectStructureContextProvider } from "./ProjectStructure";
import { Statistics } from "./Statistics";
import { Git } from "./Git";

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
            title: "Версионирование",
            icon: (
                <SvgIcon viewBox="0 0 92 92">
                    <path fill="#F05133" d="M90.156 41.965L50.036 1.848a5.918 5.918 0 00-8.372 0l-8.328 8.332 10.566 10.566a7.03 7.03 0 017.23 1.684 7.043 7.043 0 011.673 7.277l10.183 10.184a7.026 7.026 0 017.278 1.672 7.04 7.04 0 010 9.957 7.045 7.045 0 01-9.961 0 7.038 7.038 0 01-1.532-7.66L49.73 33.515v27.683a7.028 7.028 0 011.86 1.335 7.04 7.04 0 010 9.958 7.045 7.045 0 01-9.961 0 7.04 7.04 0 010-9.958 7.034 7.034 0 012.05-1.457V33.515a7.034 7.034 0 01-2.05-1.457 7.044 7.044 0 01-1.51-7.688L29.894 14.273 1.734 42.431a5.918 5.918 0 000 8.371L41.855 90.92a5.92 5.92 0 008.372 0l39.93-39.924a5.925 5.925 0 000-8.031z"/>
                </SvgIcon>
            ),
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