import { useEffect } from "react";

import { Accordion, AccordionDetails, AccordionSummary, alpha, Box, Typography } from "@mui/material";
import { green, red } from "@mui/material/colors";
import KeyboardArrowRightRoundedIcon from "@mui/icons-material/KeyboardArrowRightRounded";

import { useProblemsContext } from "./ProblemsContext";
import { SidebarTool } from "../LeftSidebar";
import ScrollableContainer from "../ScrollableContainer";
import { analysisAPI } from "../../utils/api";

const Problems = (props) => {
    const [problems, setProblems] = useProblemsContext();
    // projectId должен быть получен из контекста или пропсов
    const projectId = props.projectId || 1; // TODO: заменить на актуальный id

    useEffect(() => {
        async function fetchProblems() {
            try {
                const res = await analysisAPI.getAnalysisResults(projectId);
                setProblems(res.problems || []);
            } catch (e) {
                setProblems([]);
            }
        }
        fetchProblems();
    }, [setProblems, projectId]);

    return (
        <SidebarTool {...props}>
            <ScrollableContainer>
                <Box sx={{ overflowX: 'hidden', pb: 1 }}>
                    {problems?.map(({ lines, description, solution }, index) => (
                        <Accordion
                            key={index}
                            elevation={0}
                            square
                            disableGutters
                            sx={{
                                '&::before': {
                                    display: 'none',
                                },
                            }}
                        >
                            <AccordionSummary
                                expandIcon={
                                    <KeyboardArrowRightRoundedIcon sx={{ fontSize: 18, color: 'text.secondary' }}/>
                                }
                                sx={{
                                    px: 1,
                                    py: 4 / 8,
                                    minHeight: 0,
                                    '& .MuiAccordionSummary-expandIconWrapper': {
                                        width: 16,
                                        order: -1,
                                        justifyContent: 'center',
                                        transition: 'none',
                                        '&.Mui-expanded': {
                                            transform: 'rotate(90deg)',
                                        },
                                    },
                                    '& .MuiAccordionSummary-content': {
                                        m: 0,
                                        gap: 1,
                                        minWidth: 0,
                                    },
                                }}
                            >
                                <Typography noWrap variant="button" pl={1}>
                                    {description}
                                </Typography>
                                {lines && <Typography
                                    variant="button"
                                    sx={{
                                        fontWeight: 400,
                                        textWrap: 'nowrap',
                                        color: 'text.disabled',
                                    }}
                                >
                                    {lines.start}
                                    {lines.start !== lines.end && " - " + lines.end}
                                </Typography>}
                            </AccordionSummary>
                            <AccordionDetails sx={{
                                py: 1,
                                pr: 0,
                                fontSize: 'subtitle2.fontSize'
                            }}>
                                <Box sx={{
                                    px: 2,
                                    py: 1,
                                    borderLeft: '1px solid',
                                    borderColor: 'error.main',
                                    bgcolor: alpha(red[700], 0.1),
                                }}>
                                    {description}
                                </Box>
                                <Box sx={{
                                    mt: 2,
                                    px: 2,
                                    py: 1,
                                    borderLeft: '1px solid',
                                    borderColor: 'success.main',
                                    bgcolor: alpha(green[700], 0.1),
                                }}>
                                    {solution}
                                </Box>
                            </AccordionDetails>
                        </Accordion>
                    ))}
                </Box>
            </ScrollableContainer>
        </SidebarTool>
    );
}

export default Problems;