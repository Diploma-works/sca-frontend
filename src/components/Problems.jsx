import { Accordion, AccordionDetails, AccordionSummary, alpha, Box, Stack, Typography } from "@mui/material";
import { green, red } from "@mui/material/colors";
import KeyboardArrowRightRoundedIcon from "@mui/icons-material/KeyboardArrowRightRounded";

import SidebarTool from "./LeftSidebar/SidebarTool";

const Problems = ({ title, disableResizing, setDisableResizing }) => {
    const problems = [
        {
            lines: {
                start: 1,
                end: 10
            },
            problem: "Problem bla bla Problem bla bla Problem bla bla Problem bla bla Problem bla bla Problem bla bla",
            solution: "Do this, do that"
        },
        {
            lines: {
                start: 15,
                end: 15
            },
            problem: "Jesus! Problem bla bla",
            solution: "Don't do that again"
        },
    ]

    return (
        <SidebarTool
            title={title}
            disableResizing={disableResizing}
            setDisableResizing={setDisableResizing}
        >
            <Stack sx={{ flex: 1, overflowX: 'hidden' }}>
                {problems.map(({ lines, problem, solution }, index) => (
                    <Accordion
                        key={index}
                        elevation={0}
                        square
                        disableGutters
                        sx={{
                            bgcolor: 'background.default',
                            '&::before': {
                                display: 'none',
                            },
                        }}
                    >
                        <AccordionSummary
                            expandIcon={<KeyboardArrowRightRoundedIcon sx={{ fontSize: 18, color: 'text.secondary' }}/>}
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
                            <Typography
                                noWrap
                                variant="button"
                                sx={{
                                    pl: 1,
                                    textTransform: 'none',
                                }}
                            >
                                {problem}
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
                            fontSize: '0.875rem',
                        }}>
                            <Box sx={{
                                px: 2,
                                py: 1,
                                borderLeft: '1px solid',
                                borderColor: 'error.main',
                                bgcolor: alpha(red[700], 0.1),
                            }}>
                                {problem}
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
            </Stack>
        </SidebarTool>
    );
}

export default Problems;