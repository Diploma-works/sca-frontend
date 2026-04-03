import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Skeleton, Stack } from "@mui/material";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import GitHubIcon from "@mui/icons-material/GitHub";

import { projectAPI } from "@/utils";
import { Editor, TabsContextProvider } from "./Editor";
import { Problems, ProblemsContextProvider } from "./Problems";
import { LeftSidebar, SidebarContextProvider } from "./LeftSidebar";
import { ProjectStructure, ProjectStructureContextProvider } from "./ProjectStructure";
import { Git } from "./Git";

const Main = () => {
    const { id: projectId } = useParams();
    const { isLoading } = useQuery({ queryKey: ["projects"], queryFn: projectAPI.getAll });

    const tools = [
        {
            title: "Файлы проекта",
            icon: <FolderOutlinedIcon/>,
            component: <ProjectStructure projectId={projectId}/>
        },
        {
            title: "GitHub",
            icon: <GitHubIcon/>,
            component: <Git projectId={projectId}/>
        },
        {
            title: "Проблемы",
            icon: <ErrorOutlineRoundedIcon/>,
            component: <Problems/>
        },
    ];

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