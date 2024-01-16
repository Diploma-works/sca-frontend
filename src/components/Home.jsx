import { Box, IconButton, Tab, Tabs } from "@mui/material";

import CloseIcon from '@mui/icons-material/Close';

import { useState } from "react";

// TODO: remove
const TabLabel = ({ text }) => {
    return (
        <span>
            {text}
            <IconButton component="div" color="inherit">
                <CloseIcon fontSize="small"/>
            </IconButton>
        </span>
    );
}

const StyledTab = (props) => {
    return (
        <Tab
            {...props}
            sx={{
                p: 1,
                pl: 4.5,
                bgcolor: 'background.paper',
                textTransform: 'none',
                minHeight: 0,
                borderWidth: 'thin',
                borderStyle: 'solid',
                borderColor: 'divider',
                borderBottom: 'none',
                color: 'text.disabled',
                "&.Mui-selected": {
                    color: 'text.primary'
                },
                '&:not(:last-child)': {
                    borderRight: 'none', // Remove right border for all tabs except the last one
                },
            }}
            icon={
                <IconButton component="div" color="inherit" sx={{ p: 0 }}>
                    <CloseIcon fontSize="small"/>
                </IconButton>
            }
            iconPosition="end"
        />
    );
}

const Home = () => {
    const [activeTab, setActiveTab] = useState(0);

    const tabs = ["file1.dsl", "file2.dsl", "test.dsl"];

    return (
        <>
            <Tabs
                value={activeTab}
                onChange={(event, newValue) => setActiveTab(newValue)}
                variant="scrollable"
                scrollButtons="auto"
                allowScrollButtonsMobile={true}
                sx={{
                    minHeight: 0,
                    '& .MuiTabs-flexContainer': {},
                    '& .MuiTabScrollButton-root': {
                        bgcolor: 'background.paper',
                        borderWidth: 'thin',
                        borderStyle: 'solid',
                        borderColor: 'divider',
                        borderBottom: 'none',
                        '&.Mui-disabled': {
                            width: 0,
                            border: 'none',
                        },
                        overflow: 'hidden',
                    },
                }}
            >
                {tabs.map((text) => (
                    <StyledTab key={text} label={text}/>
                ))}
            </Tabs>
            <Box sx={{
                flex: 1,
                overflow: 'auto',
                borderWidth: 'thin',
                borderStyle: 'solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
            }}>

            </Box>
        </>
    );
}

export default Home;