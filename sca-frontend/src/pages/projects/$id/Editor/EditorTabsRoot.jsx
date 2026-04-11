import { useCallback, useState } from "react";
import { Tabs } from "@mui/material";
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

import { useTabsContext } from "./TabsContext";
import { EditorTabOverlay, SortableEditorTab } from "./EditorTab";

const EditorTabsRoot = () => {
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
                    sx={(theme) => ({
                        position: 'relative',
                        p: 0.5,
                        pb: 0,
                        minHeight: 'fit-content',
                        boxShadow: `inset 0 -1px ${theme.vars.palette.divider}`,
                        '& .MuiTabs-scroller': {
                            borderTopLeftRadius: 1,
                            borderTopRightRadius: 1,
                        },
                        '& .MuiTabs-indicator': {
                            display: 'none',
                        },
                        '& .MuiTabs-flexContainer': {
                            gap: 0.5,
                        },
                        '& .MuiTabScrollButton-root': {
                            color: 'text.secondary',
                            position: 'absolute',
                            p: 0.5,
                            zIndex: 2,
                            opacity: 1,
                            width: 'auto',
                            borderRadius: 1,
                            backdropFilter: 'blur(5px)',
                            ':first-of-type': {
                                left: theme.spacing(0.5),
                            },
                            ':last-of-type': {
                                right: theme.spacing(0.5),
                            },
                            '&.Mui-disabled': {
                                visibility: 'hidden',
                            },
                            '@media(hover: hover)': {
                                ':hover': {
                                    bgcolor: 'action.hover',
                                },
                            },
                            boxShadow: `0 0 10px 2px ${theme.vars.palette.background.paper}`,
                        },
                    })}
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