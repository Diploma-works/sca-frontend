import { Box, Stack, useTheme } from "@mui/material";

import EditorTabsRoot from "./EditorTabsRoot";
import { useTabsContext } from "../../contexts/TabsContext";

const Editor = () => {
    const theme = useTheme();
    const { tabs, moveTab, removeTab, activeValue, setActiveValue } = useTabsContext();

    return (
        <Stack sx={{
            flex: 1,
            overflow: 'hidden',
        }}>
            {tabs && <EditorTabsRoot
                tabs={tabs}
                moveTab={moveTab}
                removeTab={removeTab}
                activeValue={activeValue}
                setActiveValue={setActiveValue}
            />}
            <Box sx={{
                flex: 1,
                overflow: 'auto',
                bgcolor: 'background.paper',
            }}>
                <div style={{ width: 1920, height: 1920 }}></div>
            </Box>
        </Stack>
    );
}

export default Editor;