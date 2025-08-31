import { useCallback } from "react";
import { Tabs, useTheme } from "@mui/material";
import { useTabsContext } from "./TabsContext";
import { EditorTab } from "./EditorTab";

const EditorTabsRoot = () => {
    const theme = useTheme();
    const { tabs, removeTab, activeTab, setActiveTab } = useTabsContext();

    const handleChange = useCallback((event, newValue) => setActiveTab({ id: newValue }), [setActiveTab]);

    return (
        <Tabs
            variant="scrollable"
            scrollButtons
            allowScrollButtonsMobile
            value={activeTab?.id}
            onChange={handleChange}
            sx={{
                position: 'relative',
                p: 4 / 8,
                pb: 0,
                minHeight: 0,
                boxShadow: `inset 0 -1px ${theme.palette.divider}`,
                '& .MuiTabs-scroller': {
                    borderTopLeftRadius: theme.shape.borderRadius,
                    borderTopRightRadius: theme.shape.borderRadius,
                },
                '& .MuiTabs-indicator': {
                    display: 'none',
                },
                '& .MuiTabs-flexContainer': {
                    gap: 4 / 8,
                },
                '& .MuiTabScrollButton-root': {
                    color: 'text.secondary',
                    position: 'absolute',
                    p: 4 / 8,
                    zIndex: 2,
                    opacity: 1,
                    width: 'auto',
                    borderRadius: 1,
                    backdropFilter: 'blur(5px)',
                    ':first-of-type': {
                        left: theme.spacing(4 / 8),
                    },
                    ':last-of-type': {
                        right: theme.spacing(4 / 8),
                    },
                    '&.Mui-disabled': {
                        visibility: 'hidden',
                    },
                    '@media(hover: hover)': {
                        ':hover': {
                            bgcolor: 'action.hover',
                        },
                    },
                    boxShadow: `0 0 10px 2px ${theme.palette.background.paper}`,
                },
            }}
        >
            {tabs.map(({ id, label }) => (
                <EditorTab key={id} value={id} label={label} removeTab={removeTab}/>
            ))}
        </Tabs>
    );
};

export default EditorTabsRoot;