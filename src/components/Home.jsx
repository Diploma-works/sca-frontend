import { Box, IconButton, Tab, Tabs, useTheme } from "@mui/material";

import CloseIcon from '@mui/icons-material/Close';

import { useState } from "react";

const FileTab = ({ handleClose, ...props }) => {
    const theme = useTheme();

    return (
        <Tab
            {...props}
            sx={{
                p: 1,
                pl: 4.5,
                textTransform: 'none',
                minHeight: 0,
                color: 'text.disabled',
                '.MuiIconButton-root': {
                    visibility: 'hidden',
                },
                ':hover': {
                    bgcolor: `${theme.palette.mode === "light" ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.08)'}`,
                    '.MuiIconButton-root': {
                        visibility: 'visible',
                    },
                },
                ':not(:first-of-type)': {
                    ml: '1px',
                },
                '&.Mui-selected': {
                    pointerEvents: 'none',
                    bgcolor: 'background.paper',
                    boxShadow: `1px 0 0 ${theme.palette.divider},-1px 0 0 ${theme.palette.divider}`,
                    color: 'text.primary',
                    overflow: 'visible',
                    zIndex: 2,
                    '.MuiIconButton-root': {
                        pointerEvents: 'auto',
                        visibility: 'visible',
                    },
                    /* TODO: удалить. Оставил только ради уголков, чтобы потом если что вернуться к этому дизайну
                    '::before, ::after': {
                        content: '""',
                        width: '6px',
                        height: '12px',
                        position: 'absolute',
                        bottom: 0,
                        boxShadow: `0 6px 0 0 ${theme.palette.background.paper}`,
                        border: `thin solid ${theme.palette.divider}`,
                        borderTop: 'none',
                    },
                    '::before': {
                        left: '-6px',
                        borderBottomRightRadius: 6,
                        borderLeft: 'none',
                    },
                    '::after': {
                        right: '-6px',
                        borderBottomLeftRadius: 6,
                        borderRight: 'none',
                    },
                    ':first-of-type::before, :last-of-type::after': {
                        display: 'none', // иначе будет скролл из-за "уголков"
                    },
                    */
                },
            }}
            icon={
                <IconButton component="div" color="inherit" sx={{ p: 0 }} onClick={(event) => handleClose(event)}>
                    <CloseIcon fontSize="small"/>
                </IconButton>
            }
            iconPosition="end"
        />
    );
}

const Home = () => {
    const [activeTab, setActiveTab] = useState(0);
    const [tabs, setTabs] = useState(["file1.dsl", "file2.dsl", "test.dsl", "file3.dsl", "testttt.dsl", "file9.dsl", "file8.dsl", "t.dsl", "file28.dsl", "no.dsl"]);
    const theme = useTheme();

    const handleClose = (event, indexToDelete) => {
        event.stopPropagation();

        const updatedTabs = tabs.toSpliced(indexToDelete, 1);
        //console.log(indexToDelete);
        setTabs(updatedTabs);
        if (indexToDelete === activeTab) {
            setActiveTab(indexToDelete === 0 ? 0 : indexToDelete - 1);
        } else if (indexToDelete < activeTab) {
            setActiveTab(activeTab - 1);
        }
    };

    return (
        <>
            <Tabs
                value={activeTab}
                onChange={(event, newValue) => setActiveTab(newValue)}
                variant="scrollable"
                scrollButtons
                allowScrollButtonsMobile
                sx={{
                    minHeight: 0,
                    position: 'relative', // нужен для кнопок!
                    borderLeft: `thin solid ${theme.palette.divider}`,
                    borderRight: `thin solid ${theme.palette.divider}`,
                    '& .MuiTabs-indicator': {
                        zIndex: 2,
                        transition: 'none',
                        top: 0,
                    },
                    '& .MuiTabScrollButton-root': {
                        '&.Mui-disabled': {
                            visibility: 'hidden',
                        },
                        position: 'absolute',
                        borderBottom: `thin solid ${theme.palette.divider}`,
                        backdropFilter: 'blur(5px)',
                        height: 36,
                        zIndex: 3,
                        opacity: 1,
                        '::before, ::after': {
                            pointerEvents: 'none',
                            content: '""',
                            position: 'absolute',
                            width: 40,
                            height: '100%',
                            top: 0,
                        },
                        ':first-of-type': {
                            left: 0,
                            borderRight: `thin solid ${theme.palette.divider}`,
                            '::after': {
                                right: -41,
                                boxShadow: `inset 40px 0 40px -40px ${theme.palette.background.default}`,
                            },
                        },
                        ':last-of-type': {
                            right: 0,
                            borderLeft: `thin solid ${theme.palette.divider}`,
                            '::before': {
                                left: -41,
                                boxShadow: `inset -40px 0 40px -40px ${theme.palette.background.default}`,
                            },
                        },
                    },
                }}
            >
                {tabs.map((label, key) => (
                    <FileTab key={key} label={label} handleClose={(event) => handleClose(event, key)}/>
                ))}
            </Tabs>
            <Box sx={{
                flex: 1,
                overflow: 'auto',
                border: `thin solid ${theme.palette.divider}`,
                borderTop: 'none',
                boxShadow: `0 -1px 0 ${theme.palette.divider}`,
                bgcolor: 'background.paper',
                zIndex: 1,
            }}>

            </Box>
        </>
    );
}

export default Home;