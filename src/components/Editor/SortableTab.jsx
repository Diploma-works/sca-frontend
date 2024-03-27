import { DragOverlay } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { IconButton, SvgIcon, Tab, useTheme } from "@mui/material";
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

const SortableTabLabel = ({ label, handleClose }) => {
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
}

const SortableTab = ({ value, label, handleClose, ...props }) => {
    const theme = useTheme();
    const {
        isDragging,
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: value });

    return (
        <Tab
            {...attributes}
            {...listeners}
            {...props}
            ref={setNodeRef}
            value={value}
            label={<SortableTabLabel label={label} handleClose={handleClose} renderCloseButton={true}/>}
            sx={{
                mb: '1px',
                transform: CSS.Transform.toString(transform),
                transition,
                ...commonTabSx,
                ...(isDragging ? {
                    color: 'transparent !important',
                    bgcolor: 'action.focus',
                    boxShadow: `
                        1px 0 ${theme.palette.action.focus},
                        -1px 0 ${theme.palette.action.focus}
                    `,
                    '.MuiSvgIcon-root': {
                        visibility: 'hidden',
                    },
                } : {
                    zIndex: 1,
                    color: 'text.primary',
                    bgcolor: 'background.default',
                    '.MuiIconButton-root': {
                        visibility: 'hidden',
                    },
                    ':hover': {
                        bgcolor: 'action.hover',
                        boxShadow: `
                            1px 0 ${theme.palette.divider},
                            -1px 0 ${theme.palette.divider}
                        `,
                        '.MuiIconButton-root': {
                            visibility: 'visible',
                        },
                    },
                    '&.Mui-selected': {
                        zIndex: 2,
                        color: 'text.primary',
                        bgcolor: 'background.paper',
                        boxShadow: `
                            1px 0 ${theme.palette.divider},
                            -1px 0 ${theme.palette.divider},
                            inset 0 2px ${theme.palette.primary.main},
                            0 1px ${theme.palette.background.paper}
                        `,
                        '.MuiIconButton-root': {
                            visibility: 'visible',
                        },
                    },
                })
            }}
        />
    );
}

const SortableTabOverlay = ({ draggedTab, value }) => {
    const theme = useTheme();

    return (
        <DragOverlay>
            {draggedTab &&
                <Tab
                    sx={{
                        ...commonTabSx,
                        pr: 4.5,
                        bgcolor: 'background.paper',
                        boxShadow: `
                            0 0 10px 2px ${theme.palette.background.default}
                            ${draggedTab.id === value ? `, inset 0 2px ${theme.palette.primary.main}` : ''}
                        `,
                        opacity: 1,
                        cursor: 'grab',
                    }}
                    label={<SortableTabLabel label={draggedTab.label}/>}
                />
            }
        </DragOverlay>
    );
};

export { SortableTab, SortableTabOverlay };