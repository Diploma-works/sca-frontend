import { useCallback, useState } from "react";

import {
    closestCenter,
    DndContext,
    KeyboardSensor,
    MouseSensor,
    TouchSensor,
    useSensor,
    useSensors
} from "@dnd-kit/core";
import { horizontalListSortingStrategy, SortableContext, sortableKeyboardCoordinates, } from "@dnd-kit/sortable";

import { Tabs, useTheme } from "@mui/material";

import { useTabsContext } from "./TabsContext";
import { EditorTabOverlay, SortableEditorTab } from "./EditorTab";

const EditorTabsRoot = () => {
    const theme = useTheme();
    const [draggedTab, setDraggedTab] = useState(null);
    const { tabs, moveTab, removeTab, activeTab, setActiveTab } = useTabsContext();

    const sensors = useSensors(
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 500,
                tolerance: 5,
            }
        }),
        useSensor(MouseSensor, {
            activationConstraint: {
                delay: 250,
                tolerance: 5,
            }
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates
        })
    )

    const handleDragStart = useCallback((event) => {
        setDraggedTab(tabs[event.active.data.current.sortable.index]);
    }, [tabs])

    const handleDragEnd = useCallback(({ active, over }) => {
        setDraggedTab(null);
        if (!over || active.id === over.id) {
            return;
        }
        moveTab(active.data.current.sortable.index, over.data.current.sortable.index);
    }, [moveTab]);

    const handleChange = useCallback((event, newValue) => setActiveTab({ id: newValue }), [setActiveTab]);

    return (
        <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            collisionDetection={closestCenter}
            autoScroll={{ acceleration: 1, layoutShiftCompensation: false }}
        >
            <SortableContext items={tabs} strategy={horizontalListSortingStrategy}>
                <Tabs
                    variant="scrollable"
                    scrollButtons
                    allowScrollButtonsMobile
                    value={activeTab?.id}
                    onChange={handleChange}
                    sx={{
                        position: 'relative',
                        p: 4 / 8,
                        pb: 0,
                        minHeight: 0,
                        boxShadow: `inset 0 -1px ${theme.palette.divider}`,
                        '& .MuiTabs-scroller': {
                            borderTopLeftRadius: theme.shape.borderRadius,
                            borderTopRightRadius: theme.shape.borderRadius,
                        },
                        '& .MuiTabs-indicator': {
                            display: 'none',
                        },
                        '& .MuiTabs-flexContainer': {
                            gap: 4 / 8,
                        },
                        '& .MuiTabScrollButton-root': {
                            color: 'text.secondary',
                            position: 'absolute',
                            p: 4 / 8,
                            zIndex: 2,
                            opacity: 1,
                            width: 'auto',
                            borderRadius: 1,
                            backdropFilter: 'blur(5px)',
                            ':first-of-type': {
                                left: theme.spacing(4 / 8),
                            },
                            ':last-of-type': {
                                right: theme.spacing(4 / 8),
                            },
                            '&.Mui-disabled': {
                                visibility: 'hidden',
                            },
                            '@media(hover: hover)': {
                                ':hover': {
                                    bgcolor: 'action.hover',
                                },
                            },
                            boxShadow: `0 0 10px 2px ${theme.palette.background.paper}`,
                        },
                    }}
                >
                    {tabs.map(({ id, label }) => (
                        <SortableEditorTab key={id} value={id} label={label} removeTab={removeTab}/>
                    ))}
                </Tabs>
            </SortableContext>
            <EditorTabOverlay draggedTab={draggedTab}/>
        </DndContext>
    );
};

export default EditorTabsRoot;