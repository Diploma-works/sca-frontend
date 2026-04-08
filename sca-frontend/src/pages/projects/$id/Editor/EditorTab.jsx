import { memo, useCallback } from "react";
import { Box, IconButton, SvgIcon, Tab } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

import { DragOverlay } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { fileTypeIcons, getFileType } from "@/utils/fileTypes";

const commonTabSx = {
    p: 0.5,
    pl: 0.75,
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
            <Box sx={{ ml: 0.5, width: 20, height: 20 }}>
                {handleClose && (
                    <IconButton component="div" onClick={handleClose} sx={{ p: 0.25 }}>
                        <CloseIcon sx={{ fontSize: 16 }}/>
                    </IconButton>
                )}
            </Box>
        </>
    );
});

const EditorTab = memo(({ value, label, removeTab, ...rest }) => {
    const handleClose = useCallback((e) => {
        e.stopPropagation(); // ОЧЕНЬ важная строка, если не вызвать эту функцию - контекст сломается!!!
        removeTab(value);
    }, [removeTab, value]);

    return (
        <Tab
            {...rest}
            value={value}
            label={<EditorTabLabel label={label} handleClose={handleClose}/>}
            sx={(theme) => ({
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
                        left: '50%',
                        bottom: `calc(0px - ${theme.spacing(0.5)} - 1px)`,
                        width: `calc(100% - ${theme.spacing(1)})`,
                        height: 2,
                        transform: 'translateX(-50%)',
                        content: '""',
                        pointerEvents: 'none',
                        bgcolor: 'primary.main',
                        transition: 'width 0.2s',
                    },
                },
            })}
        />
    );
});

const SortableEditorTab = (props) => {
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
            sx={(theme) => ({
                transition,
                borderRadius: 1,
                transform: CSS.Transform.toString(transform),
                mb: `calc(${theme.spacing(0.5)} + 1px)`,
                ...(isDragging ? {
                    zIndex: 0,
                    bgcolor: 'action.focus',
                    '.MuiTab-root': {
                        opacity: 0,
                    }
                } : {
                    zIndex: 1,
                }),
            })}
        >
            <EditorTab {...props}/>
        </Box>
    );
}

const EditorTabOverlay = ({ draggedTab }) => {
    return (
        <DragOverlay>
            {draggedTab && (
                <Tab
                    label={<EditorTabLabel label={draggedTab.label}/>}
                    sx={(theme) => ({
                        ...commonTabSx,
                        opacity: 1,
                        cursor: 'grab',
                        boxShadow: `0 0 10px 2px ${theme.vars.palette.background.default}`,
                    })}
                />
            )}
        </DragOverlay>
    );
};

export { EditorTab, SortableEditorTab, EditorTabOverlay };