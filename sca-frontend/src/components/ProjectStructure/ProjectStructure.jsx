import { cloneElement, memo, useEffect, useState } from "react";

import { RichTreeView } from "@mui/x-tree-view/RichTreeView";
import { TreeItem } from "@mui/x-tree-view/TreeItem";
import { useTreeViewApiRef } from "@mui/x-tree-view";
import { 
    Box, Skeleton, Stack, SvgIcon, useTheme, Button, Dialog, DialogTitle, 
    DialogContent, DialogActions, TextField, Menu, MenuItem, ListItemIcon, 
    ListItemText, Divider, Snackbar, Alert 
} from "@mui/material";

import KeyboardArrowRightRoundedIcon from "@mui/icons-material/KeyboardArrowRightRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import UnfoldLessRoundedIcon from "@mui/icons-material/UnfoldLessRounded";
import UnfoldMoreRoundedIcon from "@mui/icons-material/UnfoldMoreRounded";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import FileCopyIcon from "@mui/icons-material/FileCopy";
import CreateNewFolderIcon from "@mui/icons-material/CreateNewFolder";
import NoteAddIcon from "@mui/icons-material/NoteAdd";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

import ITEMS from "./items";
import { SidebarTool } from "../LeftSidebar/";
import { useTabsContext } from "../Editor";
import { useProjectStructureContext } from "./ProjectStructureContext";
import { fileTypeIcons, getFileType } from "../../utils/fileTypes";
import ScrollableContainer from "../ScrollableContainer";
import { fileAPI } from "../../utils/api";

// TODO: упростить (пока нельзя, потому что path собирается здесь)
const ProjectStructureItemLabel = memo(({ 
    id, label, path, isFolder, addTab, onDeleteFile, onRenameFile, 
    onCreateFile, onCreateFolder, onCopyPath, onRefreshStructure 
}) => {
    const icon = isFolder ? fileTypeIcons.folder : (fileTypeIcons[getFileType(label)] ?? fileTypeIcons.unknown);
    
    const [contextMenu, setContextMenu] = useState(null);
    const [renameDialogOpen, setRenameDialogOpen] = useState(false);
    const [newName, setNewName] = useState(label);

    const handleDoubleClick = () => addTab({ id, label, path: Array.isArray(path) ? path : (path ? [path] : []) });

    const handleContextMenu = (event) => {
        event.preventDefault();
        setContextMenu(
            contextMenu === null
                ? {
                    mouseX: event.clientX + 2,
                    mouseY: event.clientY - 6,
                }
                : null,
        );
    };

    const handleCloseContextMenu = () => {
        setContextMenu(null);
    };

    const handleCopyPath = async () => {
        try {
            await navigator.clipboard.writeText(id);
            onCopyPath && onCopyPath(id);
        } catch (err) {
            console.error('Failed to copy path:', err);
        }
        handleCloseContextMenu();
    };

    const handleRename = () => {
        setNewName(label);
        setRenameDialogOpen(true);
        handleCloseContextMenu();
    };

    const handleRenameConfirm = () => {
        if (newName.trim() && newName !== label) {
            onRenameFile && onRenameFile(id, newName.trim());
        }
        setRenameDialogOpen(false);
    };

    const handleDelete = () => {
        if (window.confirm(`Вы уверены, что хотите удалить "${label}"?`)) {
            onDeleteFile && onDeleteFile(id);
        }
        handleCloseContextMenu();
    };

    const handleCreateFile = () => {
        onCreateFile && onCreateFile(id);
        handleCloseContextMenu();
    };

    const handleCreateFolder = () => {
        onCreateFolder && onCreateFolder(id);
        handleCloseContextMenu();
    };

    return (
        <>
            <Stack 
                direction="row" 
                spacing={1} 
                onDoubleClick={!isFolder ? handleDoubleClick : null}
                onContextMenu={handleContextMenu}
                sx={{ cursor: 'context-menu' }}
            >
                <SvgIcon sx={{ width: 18, height: 18 }}>{icon}</SvgIcon>
                <span>{label}</span>
            </Stack>

            <Menu
                open={contextMenu !== null}
                onClose={handleCloseContextMenu}
                anchorReference="anchorPosition"
                anchorPosition={
                    contextMenu !== null
                        ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
                        : undefined
                }
                slotProps={{
                    paper: {
                        sx: {
                            minWidth: 200,
                        },
                    },
                }}
            >
                {!isFolder && (
                    <MenuItem onClick={() => { handleDoubleClick(); handleCloseContextMenu(); }}>
                        <ListItemIcon>
                            <EditIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>Открыть в редакторе</ListItemText>
                    </MenuItem>
                )}
                
                <MenuItem onClick={handleCopyPath}>
                    <ListItemIcon>
                        <ContentCopyIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Копировать путь</ListItemText>
                </MenuItem>

                <MenuItem onClick={handleRename}>
                    <ListItemIcon>
                        <EditIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Переименовать</ListItemText>
                </MenuItem>

                <Divider />

                {isFolder && (
                    <>
                        <MenuItem onClick={handleCreateFile}>
                            <ListItemIcon>
                                <NoteAddIcon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText>Создать файл</ListItemText>
                        </MenuItem>

                        <MenuItem onClick={handleCreateFolder}>
                            <ListItemIcon>
                                <CreateNewFolderIcon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText>Создать папку</ListItemText>
                        </MenuItem>

                        <Divider />
                    </>
                )}

                <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
                    <ListItemIcon>
                        <DeleteIcon fontSize="small" color="error" />
                    </ListItemIcon>
                    <ListItemText>Удалить</ListItemText>
                </MenuItem>
            </Menu>

            {/* Диалог переименования */}
            <Dialog open={renameDialogOpen} onClose={() => setRenameDialogOpen(false)}>
                <DialogTitle>Переименовать {isFolder ? 'папку' : 'файл'}</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Новое имя"
                        fullWidth
                        variant="outlined"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleRenameConfirm()}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setRenameDialogOpen(false)}>Отмена</Button>
                    <Button 
                        onClick={handleRenameConfirm} 
                        variant="contained"
                        disabled={!newName.trim() || newName === label}
                    >
                        Переименовать
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
});

const ProjectStructureItem = ({ itemId, label, path, children, contextHandlers }) => {
    const theme = useTheme();
    const { addTab } = useTabsContext();

    const isLoading = itemId.startsWith("_");

    return (
        <TreeItem
            itemId={itemId}
            label={isLoading ? <Skeleton animation="wave"/> :
                <ProjectStructureItemLabel
                    id={itemId}
                    label={label}
                    path={path}
                    isFolder={children?.length}
                    addTab={addTab}
                    {...contextHandlers}
                />
            }
            sx={{
                '.MuiTreeItem-iconContainer': {
                    color: 'text.secondary',
                },
                '.MuiTreeItem-content': {
                    gap: 1,
                    borderRadius: 0,
                    userSelect: 'none',
                    '&.Mui-selected, &.Mui-selected.Mui-focused': {
                        bgcolor: 'bg.main',
                        '&:hover': {
                            bgcolor: 'bg.dark',
                        }
                    },
                    '.MuiTreeItem-label': {
                        ...theme.typography.button,
                        textWrap: 'nowrap',
                    },
                },
                '.MuiTreeItem-groupTransition': {
                    ml: 2,
                    pl: 0,
                    borderLeft: `1px solid ${theme.palette.divider}`,
                },
            }}
        >
            {children?.map((child) => cloneElement(child, {
                contextHandlers: contextHandlers,
                slotProps: {
                    item: {
                        // TODO: убрать это безобразие! нужен только parent id
                        path: path ? [...path, { id: itemId, label }] : [{ id: itemId, label }]
                    }
                }
            }))}
        </TreeItem>
    );
};

const ProjectStructure = memo((props) => {
    const [items, setItems] = useState([]);
    const { expandedItems, setExpandedItems, selectedItems, setSelectedItems } = useProjectStructureContext();
    const treeViewApiRef = useTreeViewApiRef();
    const projectId = props.projectId || 6; // TODO: заменить на актуальный id

    // Состояния для создания файла
    const [createFileDialogOpen, setCreateFileDialogOpen] = useState(false);
    const [newFileName, setNewFileName] = useState("");
    const [creatingFile, setCreatingFile] = useState(false);
    const [createFileError, setCreateFileError] = useState(null);

    // Состояния для уведомлений
    const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });

    // Состояния для создания из контекстного меню
    const [quickCreateDialog, setQuickCreateDialog] = useState({ 
        open: false, 
        type: 'file', // 'file' or 'folder'
        parentPath: '',
        name: ''
    });

    // Функция для обновления структуры
    const refreshStructure = async () => {
        try {
            const structure = await fileAPI.getProjectStructure(projectId);
            // Рекурсивно добавляем id для каждого элемента
            function addIdsAndLabels(items, parentPath = "") {
                return items.map(item => {
                    const id = (parentPath ? parentPath + "/" : "") + item.name;
                    const label = item.label ?? item.name;
                    const newItem = { ...item, id, label };
                    if (item.children) {
                        newItem.children = addIdsAndLabels(item.children, id);
                    }
                    return newItem;
                });
            }
            setItems(addIdsAndLabels(structure));
            console.log(addIdsAndLabels(structure));
        } catch (e) {
            setItems([]);
            showNotification('Ошибка загрузки структуры проекта', 'error');
        }
    };

    useEffect(() => {
        refreshStructure();
    }, [projectId]);

    // Функция для показа уведомлений
    const showNotification = (message, severity = 'info') => {
        setNotification({ open: true, message, severity });
    };

    // Обработчики контекстного меню
    const handleDeleteFile = async (filePath) => {
        try {
            await fileAPI.deleteFile(projectId, filePath);
            showNotification(`Файл "${filePath}" удален`, 'success');
            refreshStructure();
        } catch (error) {
            showNotification('Ошибка удаления файла: ' + error.message, 'error');
        }
    };

    const handleRenameFile = async (oldPath, newName) => {
        try {
            await fileAPI.renameFile(projectId, oldPath, newName);
            showNotification(`Файл переименован в "${newName}"`, 'success');
            refreshStructure();
        } catch (error) {
            showNotification('Ошибка переименования файла: ' + error.message, 'error');
        }
    };

    const handleCopyPath = (filePath) => {
        showNotification(`Путь скопирован: ${filePath}`, 'info');
    };

    const handleCreateFileInFolder = (folderPath) => {
        setQuickCreateDialog({
            open: true,
            type: 'file',
            parentPath: folderPath,
            name: ''
        });
    };

    const handleCreateFolderInFolder = (folderPath) => {
        setQuickCreateDialog({
            open: true,
            type: 'folder',
            parentPath: folderPath,
            name: ''
        });
    };

    // Функция создания файла (главная кнопка)
    const handleCreateFile = async () => {
        if (!newFileName.trim()) return;
        setCreatingFile(true);
        setCreateFileError(null);
        try {
            await fileAPI.createFileRequest(projectId, newFileName);
            setCreateFileDialogOpen(false);
            setNewFileName("");
            showNotification('Файл успешно создан', 'success');
            refreshStructure();
        } catch (e) {
            setCreateFileError("Ошибка создания файла: " + (e.message || e));
        } finally {
            setCreatingFile(false);
        }
    };

    // Функция быстрого создания из контекстного меню
    const handleQuickCreate = async () => {
        if (!quickCreateDialog.name.trim()) return;
        
        try {
            const fullPath = quickCreateDialog.parentPath 
                ? `${quickCreateDialog.parentPath}/${quickCreateDialog.name}`
                : quickCreateDialog.name;

            if (quickCreateDialog.type === 'file') {
                await fileAPI.createFileRequest(projectId, fullPath);
                showNotification('Файл успешно создан', 'success');
            } else {
                await fileAPI.createFolder(projectId, fullPath);
                showNotification('Папка успешно создана', 'success');
            }
            
            setQuickCreateDialog({ open: false, type: 'file', parentPath: '', name: '' });
            refreshStructure();
        } catch (e) {
            showNotification(`Ошибка создания ${quickCreateDialog.type === 'file' ? 'файла' : 'папки'}: ` + (e.message || e), 'error');
        }
    };

    // TODO: добавить полноценные функции
    const additionalActions = [
        {
            title: "Развернуть все",
            icon: <UnfoldMoreRoundedIcon/>,
            props: {
                onClick: () => console.log(treeViewApiRef.current)
            }
        },
        {
            title: "Свернуть все",
            icon: <UnfoldLessRoundedIcon/>,
            props: {
                onClick: () => console.log(treeViewApiRef.current)
            }
        }
    ];

    // TODO: обернуть в useCallback?
    const handleExpandedItemsChange = (e, itemIds) => setExpandedItems(itemIds);
    const handleSelectedItemsChange = (e, itemIds) => setSelectedItems(itemIds);

    // TODO: добавить вызов этой функции при нажатии в PathBreadcrumbs
    const handleItemExpansionToggle = async (event, itemId) => {
        // Можно реализовать подгрузку дочерних элементов, если API поддерживает
    };

    // Объект с обработчиками для контекстного меню
    const contextHandlers = {
        onDeleteFile: handleDeleteFile,
        onRenameFile: handleRenameFile,
        onCreateFile: handleCreateFileInFolder,
        onCreateFolder: handleCreateFolderInFolder,
        onCopyPath: handleCopyPath,
        onRefreshStructure: refreshStructure
    };

    return (
        <Box>
            <Button
                variant="outlined"
                sx={{ mb: 2 }}
                onClick={() => setCreateFileDialogOpen(true)}
            >
                Создать файл
            </Button>

            {/* Диалог создания файла (главная кнопка) */}
            <Dialog open={createFileDialogOpen} onClose={() => setCreateFileDialogOpen(false)}>
                <DialogTitle>Создать новый файл</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Путь и имя файла (например, src/newFile.js)"
                        fullWidth
                        variant="outlined"
                        value={newFileName}
                        onChange={e => setNewFileName(e.target.value)}
                        disabled={creatingFile}
                        error={!!createFileError}
                        helperText={createFileError}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setCreateFileDialogOpen(false)} disabled={creatingFile}>Отмена</Button>
                    <Button onClick={handleCreateFile} variant="contained" disabled={!newFileName.trim() || creatingFile}>
                        Создать
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Диалог быстрого создания (из контекстного меню) */}
            <Dialog open={quickCreateDialog.open} onClose={() => setQuickCreateDialog({ ...quickCreateDialog, open: false })}>
                <DialogTitle>
                    Создать {quickCreateDialog.type === 'file' ? 'файл' : 'папку'} в "{quickCreateDialog.parentPath}"
                </DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label={`Имя ${quickCreateDialog.type === 'file' ? 'файла' : 'папки'}`}
                        fullWidth
                        variant="outlined"
                        value={quickCreateDialog.name}
                        onChange={e => setQuickCreateDialog({ ...quickCreateDialog, name: e.target.value })}
                        onKeyPress={(e) => e.key === 'Enter' && handleQuickCreate()}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setQuickCreateDialog({ ...quickCreateDialog, open: false })}>
                        Отмена
                    </Button>
                    <Button 
                        onClick={handleQuickCreate} 
                        variant="contained" 
                        disabled={!quickCreateDialog.name.trim()}
                    >
                        Создать
                    </Button>
                </DialogActions>
            </Dialog>

            <SidebarTool {...props} additionalActions={additionalActions}>
                <ScrollableContainer style={{ flex: 1 }}>
                    <Box display="flex">
                        <RichTreeView
                            apiRef={treeViewApiRef}
                            items={items}
                            selectedItems={selectedItems}
                            expandedItems={expandedItems}
                            slots={{
                                item: (itemProps) => <ProjectStructureItem {...itemProps} contextHandlers={contextHandlers} />,
                                expandIcon: KeyboardArrowRightRoundedIcon,
                                collapseIcon: KeyboardArrowDownRoundedIcon
                            }}
                            sx={{ flex: 1 }}
                            onExpandedItemsChange={handleExpandedItemsChange}
                            onSelectedItemsChange={handleSelectedItemsChange}
                            onItemExpansionToggle={handleItemExpansionToggle}
                        />
                    </Box>
                </ScrollableContainer>
            </SidebarTool>

            {/* Уведомления */}
            <Snackbar
                open={notification.open}
                autoHideDuration={4000}
                onClose={() => setNotification({ ...notification, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert 
                    onClose={() => setNotification({ ...notification, open: false })} 
                    severity={notification.severity}
                    sx={{ width: '100%' }}
                >
                    {notification.message}
                </Alert>
            </Snackbar>
        </Box>
    );
});

export default ProjectStructure;