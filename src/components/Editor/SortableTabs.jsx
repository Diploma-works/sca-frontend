import { useState } from "react";

import {
    closestCenter,
    DndContext,
    KeyboardSensor,
    MouseSensor,
    TouchSensor,
    useSensor,
    useSensors
} from "@dnd-kit/core";
import {
    arrayMove,
    horizontalListSortingStrategy,
    SortableContext,
    sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";

import { Tabs, useTheme } from "@mui/material";

import { SortableTab, SortableTabOverlay } from "./SortableTab";

const SortableTabs = ({ tabs, setTabs }) => {
    const theme = useTheme();

    const [value, setValue] = useState(tabs[0]?.id ?? null);
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

    const handleDragStart = (event) => {
        setDraggedTab(tabs[event.active.data.current.sortable.index]);
    }

    const handleDragEnd = ({ active, over }) => {
        setDraggedTab(null);
        if (!over || active.id === over.id) {
            return;
        }

        setTabs((tabs) => {
            const oldIndex = tabs.findIndex((user) => user.id === active.id);
            const newIndex = tabs.findIndex((user) => user.id === over.id);
            return arrayMove(tabs, oldIndex, newIndex);
        });
    };

    const handleClose = (event, indexToDelete) => {
        event.stopPropagation();
        const updatedTabs = Array.from(tabs);
        updatedTabs.splice(indexToDelete, 1);

        if (tabs[indexToDelete].id === value) {
            setValue(indexToDelete === 0 ? updatedTabs[0]?.id : tabs[indexToDelete - 1].id);
        }
        setTabs(updatedTabs);
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <SortableContext items={tabs} strategy={horizontalListSortingStrategy}>
                <Tabs
                    value={value}
                    onChange={(event, newValue) => setValue(newValue)}
                    variant="scrollable"
                    scrollButtons
                    allowScrollButtonsMobile
                    sx={{
                        position: 'relative',
                        minHeight: 0,
                        boxShadow: `inset 0 -1px ${theme.palette.divider}`,
                        '& .MuiTabs-indicator': {
                            display: 'none',
                        },
                        '& .MuiTabs-flexContainer': {
                            gap: '1px',
                        },
                        '& .MuiTabScrollButton-root': {
                            position: 'absolute',
                            height: 36,
                            zIndex: 3,
                            opacity: 1,
                            boxSizing: 'content-box',
                            backdropFilter: 'blur(5px)',
                            borderBottom: `thin solid ${theme.palette.divider}`,
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
                                borderRight: `thin solid ${theme.palette.divider}`,
                                '::after': {
                                    right: -41,
                                    boxShadow: `inset 40px 0 40px -40px ${theme.palette.background.default}`,
                                },
                            },
                            ':last-of-type': {
                                right: 0,
                                borderLeft: `thin solid ${theme.palette.divider}`,
                                '::before': {
                                    left: -41,
                                    boxShadow: `inset -40px 0 40px -40px ${theme.palette.background.default}`,
                                },
                            },
                        },
                    }}
                >
                    {tabs.map((tab, index) => (
                        <SortableTab
                            key={tab.id}
                            value={tab.id}
                            label={tab.label}
                            handleClose={(event) => handleClose(event, index)}
                        />
                    ))}
                </Tabs>
            </SortableContext>
            <SortableTabOverlay draggedTab={draggedTab} value={value}/>
        </DndContext>
    );
};

export default SortableTabs;