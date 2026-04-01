import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
    Box,
    Button,
    Divider,
    ListItemIcon,
    ListItemText,
    ListSubheader,
    MenuItem,
    Skeleton,
    Stack,
    TextField
} from "@mui/material";

import AddRoundedIcon from "@mui/icons-material/AddRounded";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import GitHubIcon from "@mui/icons-material/GitHub";
import { FaGitSquare } from "react-icons/fa";

import Navbar from "@/components/Navbar";
import { NavbarBreadcrumbs } from "@/components/NavbarBreadcrumbs";
import { projectAPI } from "@/utils";

import { Editor, TabsContextProvider } from "./Editor";
import { Problems, ProblemsContextProvider } from "./Problems";
import { LeftSidebar, SidebarContextProvider } from "./LeftSidebar";
import { ProjectStructure, ProjectStructureContextProvider } from "./ProjectStructure";
import { Git } from "./Git";

const Main = () => {
    const { id: projectId } = useParams();
    const navigate = useNavigate();
    const { isLoading, data: projects } = useQuery({ queryKey: ["projects"], queryFn: projectAPI.getAll });

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
                        <Navbar>
                            <NavbarBreadcrumbs>
                                <Button
                                    color="inherit"
                                    onClick={() => navigate("/projects")}
                                >
                                    Проекты
                                </Button>
                                <Box sx={{ minWidth: 100, ml: 1, }}>
                                    {isLoading ? (
                                        <Skeleton animation="wave" variant="rounded" width="100%">
                                            <TextField select size="xs">
                                                <MenuItem/>
                                            </TextField>
                                        </Skeleton>
                                    ) : (
                                        <TextField
                                            fullWidth
                                            select
                                            size="xs"
                                            value={projectId}
                                            slotProps={{
                                                select: {
                                                    sx: {
                                                        fontWeight: 600
                                                    }
                                                }
                                            }}
                                        >
                                            <MenuItem>
                                                <ListItemIcon><AddRoundedIcon fontSize="small"/></ListItemIcon>
                                                <ListItemText>Новый проект</ListItemText>
                                            </MenuItem>
                                            <MenuItem>
                                                <ListItemIcon><FaGitSquare size={20}/></ListItemIcon>
                                                <ListItemText>Новый проект с Git</ListItemText>
                                            </MenuItem>
                                            <Divider component="li"/>
                                            <ListSubheader>Ваши проекты</ListSubheader>
                                            {projects.map(({ id, name }) => (
                                                <MenuItem
                                                    key={id}
                                                    value={id}
                                                    onClick={() => navigate(`/projects/${id}`)}
                                                >
                                                    {name}
                                                </MenuItem>
                                            ))}
                                        </TextField>
                                    )}
                                </Box>
                            </NavbarBreadcrumbs>
                        </Navbar>
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