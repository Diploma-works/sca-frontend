import { DndContext, useDraggable, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Stack, Tooltip, Box } from "@mui/material";
import { shapesRaw } from "./shapes/shapes";
import { useState } from 'react';

const DraggableShape = ({ shape, id }) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id,
        data: {
            type: id,
            data: shape.data,
            size: shape.size
        }
    });

    const style = {
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.5 : 1,
        cursor: isDragging ? 'grabbing' : 'grab',
        zIndex: isDragging ? 1000 : 1,
    };

    return (
        <Box
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            sx={{
                width: shape.size.width,
                height: shape.size.height,
                "&:hover": { opacity: 0.8 },
            }}
        >
            <shape.component width="100%" height="100%" />
        </Box>
    );
};

const ShapesSelector = ({ canvasRef, onCreateShape }) => {
    const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

    const sensors = useSensors(
        useSensor(MouseSensor, {
            activationConstraint: {
                distance: 5,
            },
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 250,
                tolerance: 5,
            },
        })
    );

    const handleDragStart = (event) => {
        const { activatorEvent } = event;
        
        // Get the initial pointer position
        let clientX, clientY;
        if (activatorEvent.type.startsWith('touch')) {
            const touch = activatorEvent.touches[0] || activatorEvent.changedTouches[0];
            clientX = touch.clientX;
            clientY = touch.clientY;
        } else {
            clientX = activatorEvent.clientX;
            clientY = activatorEvent.clientY;
        }
        
        // Store the initial drag position
        setDragStartPos({ x: clientX, y: clientY });
        
        // Calculate offset from the dragged element's top-left corner
        const draggedElement = activatorEvent.target.closest('[data-rnd-handle-ref]') || activatorEvent.target;
        const rect = draggedElement.getBoundingClientRect();
        setDragOffset({
            x: clientX - rect.left,
            y: clientY - rect.top
        });
    };

    const handleDragEnd = (event) => {
        const { active, delta } = event;
        const canvas = canvasRef.current;
        
        if (!canvas) return;
        
        // Calculate final position using the initial position + delta
        const finalX = dragStartPos.x + delta.x;
        const finalY = dragStartPos.y + delta.y;
        
        // Check if the final position is over the canvas
        const canvasRect = canvas.getBoundingClientRect();
        const isOverCanvas = finalX >= canvasRect.left && 
                           finalX <= canvasRect.right && 
                           finalY >= canvasRect.top && 
                           finalY <= canvasRect.bottom;
        
        if (isOverCanvas) {
            // Calculate position relative to canvas, accounting for drag offset
            const x = finalX - canvasRect.left - dragOffset.x + (active.data.current.size.width / 2);
            const y = finalY - canvasRect.top - dragOffset.y + (active.data.current.size.height / 2);
            
            onCreateShape({
                type: active.data.current.type,
                pos: [Math.max(0, x), Math.max(0, y)],
                data: active.data.current.data,
                size: active.data.current.size
            });
        }
    };

    return (
        <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            autoScroll={false}
        >
            <Stack direction="row" spacing={2} padding={2}>
                {Object.entries(shapesRaw).map(([key, shape]) => (
                    <Tooltip key={key} title={shape.tooltip} arrow>
                        <Box>
                            <DraggableShape id={key} shape={shape} />
                        </Box>
                    </Tooltip>
                ))}
            </Stack>
        </DndContext>
    );
};

export default ShapesSelector;