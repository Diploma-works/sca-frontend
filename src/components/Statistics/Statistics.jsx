import { Accordion, AccordionDetails, AccordionSummary, Box, Stack, Typography, useTheme } from "@mui/material";
import { PieChart } from "@mui/x-charts/PieChart";
import { BarChart, LineChart, mangoFusionPaletteLight } from "@mui/x-charts";
import KeyboardArrowRightRoundedIcon from "@mui/icons-material/KeyboardArrowRightRounded";
import SquareIcon from "@mui/icons-material/Square";

import { SidebarTool } from "../LeftSidebar";
import ScrollableContainer from "../ScrollableContainer";

const PIE_CHART_SIZE = 200;
const BAR_CHART_WIDTH = 300;
const BAR_CHART_HEIGHT = 300;

const Statistics = (props) => {
    const theme = useTheme();
    const colors = mangoFusionPaletteLight;

    const authorsData = [
        { id: 0, value: 90, label: 'gramdel' },
        { id: 1, value: 9, label: 'ivisaev' },
    ];

    // TODO: удалить
    const dataset = [
        {
            "SortableTab.jsx": 10,
            "Editor.jsx": 4,
            "dark.js": 1,
            description: "3 самых проблемных файла"
        },
    ]

    const filesWithMostProblemsData = [
        { id: 0, data: [10], label: "SortableTab.jsx" },
        { id: 1, data: [4], label: "Editor.jsx" },
        { id: 2, data: [1], label: "dark.js" },
    ]

    return (
        <SidebarTool {...props}>
            <ScrollableContainer style={{
                flex: 1
            }}>
                <Accordion defaultExpanded
                           elevation={0}
                           square
                           disableGutters
                           sx={{
                               '&::before': {
                                   display: 'none',
                               },
                           }}
                           slotProps={{ transition: { unmountOnExit: true } }}
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
                            Авторы проекты
                        </Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{
                        //width: 1,
                        minWidth: `calc(${PIE_CHART_SIZE}px + 2*${theme.spacing(2)})`,
                        py: 1,
                        fontSize: 'subtitle2.fontSize',
                        display: 'flex',
                        alignItems: "center",
                        flexWrap: "wrap",
                        justifyContent: "center",
                        columnGap: 2,
                        rowGap: 2,
                    }}>
                        <Box flexShrink={0}>
                            <PieChart
                                colors={colors}
                                width={PIE_CHART_SIZE}
                                height={PIE_CHART_SIZE}
                                margin={{ bottom: 0, left: 0, right: 0, top: 0 }}
                                series={[
                                    {
                                        data: authorsData,
                                        innerRadius: '30%',
                                        outerRadius: '100%',
                                        paddingAngle: parseInt(theme.spacing(4 / 8)),
                                        cornerRadius: theme.shape.borderRadius,
                                        type: 'pie'
                                    },
                                ]}
                                slotProps={{ legend: { hidden: true } }}
                            />
                        </Box>
                        <Stack>
                            {authorsData.map(({ id, label }, index) => (
                                <Typography key={id} sx={{ textWrap: 'nowrap' }}>
                                    <SquareIcon sx={{
                                        mr: 4 / 8,
                                        fontSize: 20,
                                        verticalAlign: 'text-top',
                                        color: colors[index % colors.length],
                                    }}/>
                                    {label}
                                </Typography>
                            ))}
                        </Stack>
                    </AccordionDetails>
                </Accordion>
                <Accordion defaultExpanded
                           elevation={0}
                           square
                           disableGutters
                           sx={{
                               '&::before': {
                                   display: 'none',
                               },
                           }}
                           slotProps={{ transition: { unmountOnExit: true } }}
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
                            Самые проблемные файлы
                        </Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{
                        //width: 1,
                        minWidth: `calc(${BAR_CHART_WIDTH}px + 2*${theme.spacing(2)})`,
                        py: 1,
                        fontSize: 'subtitle2.fontSize',
                        display: 'flex',
                        alignItems: "center",
                        flexWrap: "wrap",
                        justifyContent: "center",
                        columnGap: 2,
                        rowGap: 2,
                    }}>
                        <Box flexShrink={0}>
                            <BarChart
                                colors={colors}
                                margin={{

                                    right: 0,
                                    top: parseInt(theme.spacing(1)),
                                    bottom: parseInt(theme.spacing(3)),
                                }}
                                dataset={dataset}
                                xAxis={[{ scaleType: 'band', data: ["3 самых проблемных файла"] }]}
                                series={filesWithMostProblemsData}
                                width={BAR_CHART_WIDTH}
                                height={BAR_CHART_HEIGHT}
                                slotProps={{ legend: { hidden: true } }}
                            />
                        </Box>
                        <Stack>
                            {filesWithMostProblemsData.map(({ id, label }, index) => (
                                <Typography key={id} sx={{ textWrap: 'nowrap' }}>
                                    <SquareIcon sx={{
                                        mr: 4 / 8,
                                        fontSize: 20,
                                        verticalAlign: 'text-top',
                                        color: colors[index % colors.length],
                                    }}/>
                                    {label}
                                </Typography>
                            ))}
                        </Stack>
                    </AccordionDetails>
                </Accordion>
                <Accordion defaultExpanded
                           elevation={0}
                           square
                           disableGutters
                           sx={{
                               '&::before': {
                                   display: 'none',
                               },
                           }}
                           slotProps={{ transition: { unmountOnExit: true } }}
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
                            Зависимость количества проблем в проекте от времени
                        </Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{
                        //width: 1,
                        minWidth: `calc(${PIE_CHART_SIZE}px + 2*${theme.spacing(2)})`,
                        py: 1,
                        fontSize: 'subtitle2.fontSize',
                        display: 'flex',
                        alignItems: "center",
                        flexWrap: "wrap",
                        justifyContent: "center",
                        columnGap: 2,
                        rowGap: 2,
                    }}>
                        <Box flexShrink={0}>
                            <LineChart
                                disableAxisListener
                                xAxis={[{ data: [1, 2, 3, 5, 8, 10] }]}
                                series={[
                                    {
                                        data: [2, 5.5, 2, 8.5, 1.5, 5],
                                    },
                                ]}
                                width={500}
                                height={300}
                            />
                        </Box>
                    </AccordionDetails>
                </Accordion>
            </ScrollableContainer>
        </SidebarTool>
    )
}

export default Statistics;