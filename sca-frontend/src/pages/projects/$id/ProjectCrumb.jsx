import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Box, Divider, ListItemIcon, ListItemText, ListSubheader, MenuItem, Skeleton, TextField } from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import { FaGitSquare } from "react-icons/fa";

import { projectAPI } from "@/utils";

export const ProjectCrumb = ({ params }) => {
    const navigate = useNavigate();
    const { isLoading, data: projects } = useQuery({ queryKey: ["projects"], queryFn: projectAPI.getAll });
    const { id } = params;

    return (
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
                    value={id}
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
    )
}