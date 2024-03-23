import { Box, Stack, useTheme } from "@mui/material";
import { useState } from "react";
import SortableTabs from "./SortableTabs";

const Editor = () => {
    const theme = useTheme();
    const [tabs, setTabs] = useState([
        { id: 1, label: "file1.dsl" },
        { id: 2, label: "file2.dsl" },
        { id: 3, label: "test.dsl" },
        { id: 4, label: "file3.dsl" },
        { id: 5, label: "testttt.dsl" },
        { id: 6, label: "file9.dsl" },
        { id: 7, label: "file8.dsl" },
        { id: 8, label: "t.dsl" },
        { id: 9, label: "file28.dsl" },
        { id: 10, label: "no.dsl" }
    ]);

    return (
        <Stack sx={{
            flex: 1,
            overflow: 'hidden',
        }}>
            <SortableTabs tabs={tabs} setTabs={setTabs}/>
            <Box sx={{
                flex: 1,
                overflow: 'auto',
                boxShadow: `0 -1px 0 ${theme.palette.divider}`,
                bgcolor: 'background.paper',
                zIndex: 2,
            }}>
                <div style={{ width: 1920, height: 1920}}></div>
            </Box>
        </Stack>
    );
}

export default Editor;