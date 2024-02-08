import { IconButton, Tab, useTheme } from "@mui/material";
import { DragOverlay } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import CloseIcon from "@mui/icons-material/Close";

const commonTabSx = {
    p: 1,
    pl: 4.5,
    textTransform: 'none',
    minHeight: 0,
}

const SortableTab = ({ value, handleClose, ...props }) => {
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
            sx={{
                transform: CSS.Transform.toString(transform),
                transition,
                ...commonTabSx,
                ...(isDragging ? {
                    color: `transparent !important`,
                    bgcolor: `${theme.palette.mode === "light" ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.16)'}`,
                } : {
                    color: 'text.disabled',
                    bgcolor: 'background.default',
                    zIndex: 1,
                    '.MuiIconButton-root': {
                        visibility: 'hidden',
                    },
                    ':hover': {
                        bgcolor: `${theme.palette.mode === "light" ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.08)'}`,
                        '.MuiIconButton-root': {
                            visibility: 'visible',
                        },
                    },
                    ':not(:first-of-type)': {
                        ml: '1px',
                    },
                    '&.Mui-selected': {
                        bgcolor: 'background.paper',
                        boxShadow: `
                            1px 0 0 ${theme.palette.divider},
                            -1px 0 0 ${theme.palette.divider},
                            inset 0 2px ${theme.palette.primary.main}
                        `,
                        color: 'text.primary',
                        overflow: 'visible',
                        zIndex: 3,
                        '.MuiIconButton-root': {
                            pointerEvents: 'auto',
                            visibility: 'visible',
                        },
                    },
                })
            }}
            icon={
                <IconButton component="div" color="inherit" sx={{ p: 0 }}
                            onClick={(event) => handleClose(event)}>
                    <CloseIcon fontSize="small"/>
                </IconButton>
            }
            iconPosition="end"
        />
    );
};

const SortableTabOverlay = ({ draggedTab, value }) => {
    const theme = useTheme();

    return (
        <DragOverlay>
            {draggedTab ? (
                <Tab
                    sx={{
                        ...commonTabSx,
                        pr: 4.5,
                        bgcolor: 'background.paper',
                        boxShadow: `
                            0 0 10px 2px ${theme.palette.background.default}
                            ${draggedTab.id === value ? `, inset 0 2px ${theme.palette.primary.main}` : ''}
                        `,
                        cursor: 'grab',
                        opacity: 1,
                    }}
                    label={draggedTab.label}
                />
            ) : null}
        </DragOverlay>
    );
};

export { SortableTab, SortableTabOverlay };