const jsxCode = `import { memo, useCallback } from "react";

import { DragOverlay } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { Box, IconButton, SvgIcon, Tab, useTheme } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

import { fileTypeIcons, getFileType } from "../../utils/fileTypes";

const commonTabSx = {
    p: 1,
    gap: 1,
    minHeight: 0,
    flexDirection: 'row',
    lineHeight: 'normal',
    textTransform: 'none',
}

const EditorTabLabel = memo(({ label, handleClose }) => {
    const fileTypeIcon = fileTypeIcons[getFileType(label)] ?? fileTypeIcons.unknown;

    return (
        <>
            <SvgIcon sx={{ width: 20, height: 20 }}>{fileTypeIcon}</SvgIcon>
            <span>{label}</span>
            {handleClose &&
                <IconButton component="div" color="inherit" sx={{ p: 0 }} onClick={handleClose}>
                    <CloseIcon fontSize="small"/>
                </IconButton>
            }
        </>
    );
});

const EditorTabWrapper = memo(({ value, label, removeTab, ...rest }) => {
    const theme = useTheme();

    const handleClose = useCallback((event) => {
        event.stopPropagation();
        removeTab(value);
    }, [removeTab, value]);

    return (
        <Tab
            {...rest}
            value={value}
            label={<EditorTabLabel label={label} handleClose={handleClose}/>}
            sx={{
                ...commonTabSx,
                color: 'text.primary',
                bgcolor: 'background.default',
                '.MuiIconButton-root': {
                    visibility: 'hidden',
                },
                ':hover': {
                    bgcolor: 'action.hover',
                    boxShadow: \`
                        1px 0 \${theme.palette.divider},
                        -1px 0 \${theme.palette.divider}
                    \`,
                    '.MuiIconButton-root': {
                        visibility: 'visible',
                    },
                },
                '&.Mui-selected': {
                    color: 'text.primary',
                    bgcolor: 'background.paper',
                    boxShadow: \`
                        1px 0 \${theme.palette.divider},
                        -1px 0 \${theme.palette.divider},
                        inset 0 2px \${theme.palette.primary.main},
                        0 1px \${theme.palette.background.paper}
                    \`,
                    '.MuiIconButton-root': {
                        visibility: 'visible',
                    },
                },
            }}
        />
    );
});

const EditorTab = (props) => {
    const theme = useTheme();
    const {
        isDragging,
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: props.value });

    return (
        <Box
            ref={setNodeRef}
            {...attributes}
            {...listeners}
            sx={{
                mb: '1px',
                flexShrink: 0,
                transition,
                transform: CSS.Transform.toString(transform),
                ...(isDragging ? {
                    zIndex: 0,
                    bgcolor: 'action.focus',
                    boxShadow: \`
                        1px 0 \${theme.palette.action.focus},
                        -1px 0 \${theme.palette.action.focus}
                    \`,
                    '.MuiTab-root': {
                        opacity: 0,
                    }
                } : {
                    zIndex: 1,
                }),
            }}
        >
            <EditorTabWrapper {...props}/>
        </Box>
    );
}

const EditorTabOverlay = ({ draggedTab, isSelected }) => {
    const theme = useTheme();

    return (
        <DragOverlay>
            {draggedTab &&
                <Tab
                    label={<EditorTabLabel label={draggedTab.label}/>}
                    sx={{
                        ...commonTabSx,
                        pr: 4.5,
                        bgcolor: 'background.paper',
                        boxShadow: \`
                            0 0 10px 2px \${theme.palette.background.default}
                            \${isSelected ? \`, inset 0 2px \${theme.palette.primary.main}\` : ''}
                        \`,
                        opacity: 1,
                        cursor: 'grab',
                    }}
                />
            }
        </DragOverlay>
    );
};

export { EditorTab, EditorTabOverlay };`;

export default jsxCode;