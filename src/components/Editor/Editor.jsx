import { Box, Divider, List, ListItem, Stack, Typography } from "@mui/material";
import FolderIcon from "@mui/icons-material/Folder";
import WavingHandOutlinedIcon from "@mui/icons-material/WavingHandOutlined";

import EditorTabsRoot from "./EditorTabsRoot";
import { useTabsContext } from "../../contexts/TabsContext";
import HighlightedCodeBox from "./HighlightedCodeBox";
import jsxCode from "./jsxCode";
import PathBreadcrumbs from "../PathBreadcrumbs";
import ScrollableContainer from "../ScrollableContainer";


const Editor = () => {
    const { tabs, moveTab, removeTab, activeTab, setActiveTab } = useTabsContext(); // TODO: переместить часть внутрь EditorTabsRoot

    const language = "jsx";
    const code = jsxCode;
    //const code = null; // TODO: разобраться, почему происходят тормоза

    return (
        <Stack sx={{
            flex: 1,
            borderRadius: 1,
            overflow: 'hidden',
            bgcolor: 'background.paper',
        }}>
            {tabs.length ? (
                <>
                    <EditorTabsRoot
                        tabs={tabs}
                        moveTab={moveTab}
                        removeTab={removeTab}
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                    />
                    <HighlightedCodeBox language={language}>
                        {code}
                    </HighlightedCodeBox>
                    <Divider/>
                    <PathBreadcrumbs/>
                </>
            ) : (
                <>
                    <Stack direction="row" spacing={1} p={1}>
                        <WavingHandOutlinedIcon color="primary" sx={{ fontSize: 20 }}/>
                        <Typography noWrap variant="subtitle2">Добро пожаловать!</Typography>
                    </Stack>
                    <Divider/>
                    <ScrollableContainer style={{ flex: 1 }}>
                        <Box sx={{ display: 'flex' }}>
                            <Stack sx={{ px: 2, py: 1, flex: 1, fontSize: 'body2.fontSize' }}>
                                Чтобы посмотреть содержимое файла:
                                <List disablePadding sx={{ listStyle: 'decimal', pl: 4 }}>
                                    <ListItem sx={{ display: 'list-item', pr: 0 }}>
                                        Откройте инструмент&nbsp;
                                        <span style={{ whiteSpace: 'nowrap' }}>
                                            <FolderIcon sx={{ fontSize: 18, verticalAlign: 'text-top' }}/>&nbsp;
                                            <b>Файлы проекта</b>
                                        </span>
                                    </ListItem>
                                    <ListItem sx={{ display: 'list-item', pr: 0, py: 0 }}>
                                        Выберите файл и <b>дважды нажмите</b> по нему
                                    </ListItem>
                                </List>
                            </Stack>
                        </Box>
                    </ScrollableContainer>
                </>
            )}
        </Stack>
    );
}

export default Editor;