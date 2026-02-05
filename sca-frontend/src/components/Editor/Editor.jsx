import { useEffect, useMemo, useState } from "react";
import { Box, Divider, List, ListItem, Stack, Typography } from "@mui/material";
import { Button } from "@mui/material";
import FolderIcon from "@mui/icons-material/Folder";
import WavingHandOutlinedIcon from "@mui/icons-material/WavingHandOutlined";
import { useTabsStateContext } from "./TabsContext";
import EditorTabsRoot from "./EditorTabsRoot";
import PathBreadcrumbs from "./PathBreadcrumbs";
import HighlightedCodeBox from "./HighlightedCodeBox";
import { getFileType } from "../../utils/fileTypes";
import ScrollableContainer from "../ScrollableContainer";
import { fileAPI } from "../../utils/api";
import { act } from "react";

const Editor = ({ projectId }) => {
    const { tabs, activeTab } = useTabsStateContext();
    const [fileContent, setFileContent] = useState("");
    const [editedContent, setEditedContent] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState(null);
    const fileType = useMemo(() => getFileType(activeTab?.label), [activeTab]);
    const actualProjectId = projectId || 6; // TODO: заменить на актуальный id

    useEffect(() => {
        async function fetchContent() {
            if (activeTab?.label) {
                console.log('activeTab:', activeTab);
                console.log('activeTab.path:', activeTab.path);
                
                let filePath = "";
                
                try {
                    if(activeTab.path && activeTab.path.length > 0) {
                        // Собираем полный путь из всех элементов path
                        const pathParts = activeTab.path.map(p => p.id);
                        filePath = pathParts.join("/") + "/" + activeTab.label;
                    } else {
                        filePath = activeTab.label;
                    }
                    
                    console.log('Final filePath:', filePath);
                    console.log('Using projectId:', actualProjectId);
                    const content = await fileAPI.getFileContent(actualProjectId, filePath);
                    console.log('Received content:', content);
                    
                    setFileContent(content);
                    setEditedContent(content);
                } catch (e) {
                    console.error('Error fetching file content:', e);
                    console.log('Failed for filePath:', filePath);
                    setFileContent("");
                    setEditedContent("");
                }
            }
        }
        fetchContent();
    }, [activeTab, actualProjectId]);

    const handleCodeChange = (value) => {
        setEditedContent(value || "");
    };

    return (
        <Stack sx={{
            flex: 1,
            borderRadius: 1,
            overflow: 'hidden',
            bgcolor: 'background.paper',
        }}>
            <Stack sx={{
                flex: 1,
                borderRadius: 1,
                overflow: 'hidden',
                bgcolor: 'background.paper',
            }}>
                {tabs.length ? (
                    <>
                        <EditorTabsRoot/>
                        {fileType === "image" ? (
                            <>Image!!!</>
                        ) : (
                            <>
                                <Box sx={{ position: 'relative', flex: 1 }}>
                                    <HighlightedCodeBox 
                                        language={fileType}
                                        onCodeChange={handleCodeChange}
                                    >
                                        {editedContent}
                                    </HighlightedCodeBox>
                                </Box>
                                <Stack direction="row" spacing={1} sx={{ p: 1 }}>
                                    <Button
                                        variant="contained"
                                        size="small"
                                        disabled={isSaving || editedContent === fileContent}
                                        onClick={async () => {
                                            setIsSaving(true);
                                            setSaveError(null);
                                            try {
                                                await fileAPI.updateFileContent(actualProjectId, activeTab.label, editedContent);
                                                setFileContent(editedContent);
                                            } catch (e) {
                                                setSaveError("Ошибка сохранения: " + (e.message || e));
                                            } finally {
                                                setIsSaving(false);
                                            }
                                        }}
                                    >
                                        Сохранить
                                    </Button>
                                    {saveError && <Typography color="error" variant="body2">{saveError}</Typography>}
                                </Stack>
                            </>
                        )}
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
                                    </List>
                                </Stack>
                            </Box>
                        </ScrollableContainer>
                    </>
                )}
            </Stack>
        </Stack>
    );
}

export default Editor;