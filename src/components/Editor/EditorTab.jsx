import { memo, useCallback } from "react";

import { DragOverlay } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { Box, IconButton, SvgIcon, Tab, useTheme } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

import { fileTypeIcons, getFileType } from "../../utils/fileTypes";

const commonTabSx = {
    p: 4 / 8,
    minHeight: 0,
    borderRadius: 1,
    flexDirection: 'row',
    lineHeight: 'normal',
    textWrap: 'nowrap',
    color: 'text.primary',
    bgcolor: 'background.paper',
}

const EditorTabLabel = memo(({ label, handleClose }) => {
    const fileTypeIcon = fileTypeIcons[getFileType(label)] ?? fileTypeIcons.unknown;

    return (
        <>
            <SvgIcon sx={{ width: 18, height: 18, mr: 1 }}>{fileTypeIcon}</SvgIcon>
            <span>{label}</span>
            <Box sx={{ ml: 4 / 8, width: 20, height: 20 }}>
                {handleClose && (
                    <IconButton component="div" onClick={handleClose} sx={{ p: 2 / 8 }}>
                        <CloseIcon sx={{ fontSize: 16 }}/>
                    </IconButton>
                )}
            </Box>
        </>
    );
});

const EditorTab = memo(({ value, label, removeTab, ...rest }) => {
    const theme = useTheme();

    const handleClose = useCallback((e) => {
        e.stopPropagation(); // ОЧЕНЬ важная строка, если не вызвать эту функцию - контекст сломается!!!
        removeTab(value);
    }, [removeTab, value]);

    return (
        <Tab
            {...rest}
            value={value}
            label={<EditorTabLabel label={label} handleClose={handleClose}/>}
            sx={{
                ...commonTabSx,
                overflow: 'visible',
                '.MuiIconButton-root': {
                    visibility: 'hidden',
                },
                '@media(hover: hover)': {
                    ':hover': {
                        bgcolor: 'action.hover',
                        '.MuiIconButton-root': {
                            visibility: 'visible',
                        },
                    },
                },
                '&.Mui-selected': {
                    color: 'text.primary',
                    '.MuiIconButton-root': {
                        visibility: 'visible',
                    },
                    '@media(hover: hover)': {
                        ':hover::before': {
                            width: 1,
                        },
                    },
                    '::before': {
                        position: 'absolute',
                        bottom: `calc(-${theme.spacing(4 / 8)} - 1px)`,
                        width: `calc(100% - 2*${theme.spacing(4 / 8)})`,
                        height: 2,
                        content: '""',
                        pointerEvents: 'none',
                        bgcolor: 'primary.main',
                        transition: 'width 0.2s',
                    },
                },
            }}
        />
    );
});

const SortableEditorTab = (props) => {
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
                transition,
                borderRadius: 1,
                transform: CSS.Transform.toString(transform),
                mb: `calc(${theme.spacing(4 / 8)} + 1px)`,
                ...(isDragging ? {
                    zIndex: 0,
                    bgcolor: 'action.focus',
                    '.MuiTab-root': {
                        opacity: 0,
                    }
                } : {
                    zIndex: 1,
                }),
            }}
        >
            <EditorTab {...props}/>
        </Box>
    );
}

const EditorTabOverlay = ({ draggedTab }) => {
    const theme = useTheme();

    return (
        <DragOverlay>
            {draggedTab && (
                <Tab
                    label={<EditorTabLabel label={draggedTab.label}/>}
                    sx={{
                        ...commonTabSx,
                        opacity: 1,
                        cursor: 'grab',
                        boxShadow: `0 0 10px 2px ${theme.palette.background.default}`,
                    }}
                />
            )}
        </DragOverlay>
    );
};

export { EditorTab, SortableEditorTab, EditorTabOverlay };