import { Accordion, AccordionDetails, AccordionSummary, alpha, Box, Typography } from "@mui/material";
import { green, red } from "@mui/material/colors";
import KeyboardArrowRightRoundedIcon from "@mui/icons-material/KeyboardArrowRightRounded";

import SidebarTool from "./LeftSidebar/SidebarTool";
import ScrollableContainer from "./ScrollableContainer";
import { useProblemsContext } from "../contexts/ProblemsContext";
import { useEffect } from "react";

const defaultProblems = [
    {
        lines: {
            start: 1,
            end: 10
        },
        description: "Problem bla bla Problem bla bla Problem bla bla Problem bla bla Problem bla bla Problem bla bla",
        solution: "Do this, do that"
    },
    {
        lines: {
            start: 11,
            end: 12
        },
        description: "Problem bla bla Problem bla bla Problem bla bla Problem bla bla Problem bla bla Problem bla bla",
        solution: "Do this, do that"
    },
    {
        lines: {
            start: 13,
            end: 13
        },
        description: "Problem bla bla Problem bla bla Problem bla bla Problem bla bla Problem bla bla Problem bla bla",
        solution: "Do this, do that"
    },
    {
        lines: {
            start: 14,
            end: 18
        },
        description: "Problem bla bla Problem bla bla Problem bla bla Problem bla bla Problem bla bla Problem bla bla",
        solution: "Do this, do that"
    },
    {
        lines: {
            start: 19,
            end: 27
        },
        description: "Jesus! Problem bla bla",
        solution: "Don't do that again"
    },
];

const Problems = ({ title, disableResizing, setDisableResizing }) => {
    const [problems, setProblems] = useProblemsContext();

    useEffect(() => {
        setProblems(defaultProblems);
    }, [setProblems]);

    return (
        <SidebarTool
            title={title}
            disableResizing={disableResizing}
            setDisableResizing={setDisableResizing}
        >
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
                                <Typography
                                    variant="button"
                                    sx={{
                                        fontWeight: 400,
                                        textWrap: 'nowrap',
                                        color: 'text.disabled',
                                    }}
                                >
                                    {lines.start}
                                    {lines.start !== lines.end && " - " + lines.end}
                                </Typography>
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