import { cloneElement, memo } from "react";

import { RichTreeView } from "@mui/x-tree-view/RichTreeView";
import { TreeItem } from "@mui/x-tree-view/TreeItem";
import { Box, Stack, SvgIcon, useTheme } from "@mui/material";

import { fileTypeIcons, getFileType } from "../../utils/fileTypes";
import { useTabsContext } from "../../contexts/TabsContext";
import ITEMS from "./items";

const ProjectStructureItemLabel = memo(({ id, label, isFolder, addTab }) => {
    const filename = label.split("/").pop();
    const icon = isFolder ? fileTypeIcons.folder : (fileTypeIcons[getFileType(filename)] ?? fileTypeIcons.unknown);

    const handleDoubleClick = () => addTab({ id, label });

    return (
        <Stack direction="row" spacing={1} onDoubleClick={!isFolder ? handleDoubleClick : null}>
            <SvgIcon sx={{ width: 18, height: 18 }}>{icon}</SvgIcon>
            <span>{filename}</span>
        </Stack>
    )
});

const ProjectStructureItem = ({ itemId, label, children }) => {
    const theme = useTheme();
    const { addTab } = useTabsContext();

    return (
        <TreeItem
            itemId={itemId}
            label={<ProjectStructureItemLabel id={itemId} label={label} isFolder={children?.length} addTab={addTab}/>}
            sx={{
                '.MuiTreeItem-iconContainer': {
                    color: 'text.disabled',
                },
                '.MuiTreeItem-content': {
                    gap: 6 / 8,
                    borderRadius: 0,
                    userSelect: 'none',
                    '&.Mui-selected, &.Mui-selected.Mui-focused': {
                        bgcolor: 'bg.main',
                        '&:hover': {
                            bgcolor: 'bg.dark',
                        }
                    },
                    '.MuiTreeItem-label': {
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        lineHeight: 'normal',
                        textWrap: 'nowrap',
                    },
                },
                '.MuiTreeItem-groupTransition': {
                    ml: 2,
                    pl: 0,
                    position: 'relative',
                    '::before': {
                        content: '""',
                        position: 'absolute',
                        width: '1px',
                        height: '100%',
                        borderLeft: `1px solid ${theme.palette.divider}`,
                    },
                },
            }}
        >
            {children?.map((child) => cloneElement(child, { label: label + "/" + child.props.label }))}
        </TreeItem>
    );
};

const ProjectStructure = () => {
    return (
        <Stack flex={1} spacing={1 / 8}>
            <Box sx={{
                px: 1.5,
                height: 36,
                display: 'flex',
                alignItems: 'center',
                flexShrink: 0,
                fontWeight: 600,
                fontSize: '0.875rem',
                lineHeight: 'normal',
                textWrap: 'nowrap',
                userSelect: 'none',
            }}>
                Файлы проекта
            </Box>
            <RichTreeView items={ITEMS} slots={{ item: ProjectStructureItem }}/>
        </Stack>
    );
}

export default ProjectStructure;