import { Box, Stack, useTheme } from "@mui/material";
import SortableTabs from "./SortableTabs";
import { useTabs } from "../../contexts/TabsContext";

const Editor = () => {
    const theme = useTheme();
    const [tabs, setTabs] = useTabs();

    return (
        <Stack sx={{
            flex: 1,
            overflow: 'hidden',
        }}>
            {tabs && <SortableTabs tabs={tabs} setTabs={setTabs}/>}
            <Box sx={{
                flex: 1,
                overflow: 'auto',
                boxShadow: `0 -1px 0 ${theme.palette.divider}`,
                bgcolor: 'background.paper',
                zIndex: 2,
            }}>
                <div style={{ width: 1920, height: 1920 }}></div>
            </Box>
        </Stack>
    );
}

export default Editor;