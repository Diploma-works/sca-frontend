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

import { EditorTab, EditorTabOverlay } from "./EditorTab";

const EditorTabsRoot = ({ tabs, moveTab, removeTab, activeTab, setActiveTab }) => {
    const theme = useTheme();
    const [draggedTab, setDraggedTab] = useState(null);

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
                        minHeight: 0,
                        boxShadow: `inset 0 -1px ${theme.palette.altDivider}`,
                        '& .MuiTabs-indicator': {
                            display: 'none',
                        },
                        '& .MuiTabs-flexContainer': {
                            gap: '1px',
                        },
                        '& .MuiTabScrollButton-root': {
                            position: 'absolute',
                            width: 36,
                            height: 36,
                            zIndex: 3,
                            opacity: 1,
                            boxSizing: 'content-box',
                            backdropFilter: 'blur(5px)',
                            borderBottom: `thin solid ${theme.palette.altDivider}`,
                            '&.Mui-disabled': {
                                visibility: 'hidden',
                            },
                            '::before, ::after': {
                                position: 'absolute',
                                top: 0,
                                width: 40,
                                height: '100%',
                                content: '""',
                                pointerEvents: 'none',
                            },
                            ':first-of-type': {
                                left: 0,
                                borderRight: `1px solid ${theme.palette.altDivider}`,
                                '::after': {
                                    right: -41,
                                    boxShadow: `inset 40px 0 40px -40px ${theme.palette.background.default}`,
                                },
                            },
                            ':last-of-type': {
                                right: 0,
                                borderLeft: `thin solid ${theme.palette.altDivider}`,
                                '::before': {
                                    left: -41,
                                    boxShadow: `inset -40px 0 40px -40px ${theme.palette.background.default}`,
                                },
                            },
                        },
                    }}
                >
                    {tabs.map(({ id, label }) => <EditorTab key={id} value={id} label={label} removeTab={removeTab}/>)}
                </Tabs>
            </SortableContext>
            <EditorTabOverlay draggedTab={draggedTab} isSelected={draggedTab?.id === activeTab?.id}/>
        </DndContext>
    );
};

export default EditorTabsRoot;