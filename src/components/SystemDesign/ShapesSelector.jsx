import {Stack, Tooltip, Box} from "@mui/material";
import {shapesRaw} from "./shapes/shapes";
import {useState, useRef} from 'react';

const DragPreview = ({shape, isDragging, position, offset}) => {
    if (!isDragging) return null;

    return (
        <Box
            sx={{
                position: 'fixed',
                left: position.x - offset.x,
                top: position.y - offset.y,
                width: shape.size.width,
                height: shape.size.height,
                opacity: 0.8,
                zIndex: 10000,
                pointerEvents: 'none',
                transform: 'translate(0, 0)', // Force new stacking context
            }}
        >
            <Box sx={{
                position: 'absolute',
                top: -20,
                left: 0,
                fontSize: '12px',
                color: 'white',
                backgroundColor: 'rgba(0,0,0,0.7)',
                padding: '2px 6px',
                borderRadius: '4px',
                whiteSpace: 'nowrap'
            }}>
                x: {Math.round(position.x)}, y: {Math.round(position.y)}
            </Box>
            <shape.component width="100%" height="100%"/>
        </Box>
    );
};

const DraggableShape = ({shape, id, onDragEnd}) => {
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({x: 0, y: 0});
    const [dragPosition, setDragPosition] = useState({x: 0, y: 0});
    const dragRef = useRef(null);
    const dragDataRef = useRef(null);

    const handleMouseDown = (e) => {
        e.preventDefault();
        setIsDragging(true);

        const rect = dragRef.current.getBoundingClientRect();
        const offset = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
        setDragOffset(offset);
        setDragPosition({x: e.clientX, y: e.clientY});

        dragDataRef.current = {
            type: id,
            data: shape.data,
            offset
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    const handleMouseMove = (e) => {
        setDragPosition({x: e.clientX, y: e.clientY});
    };

    const handleMouseUp = (e) => {
        setIsDragging(false);

        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);

        onDragEnd({
            clientX: e.clientX,
            clientY: e.clientY,
            data: dragDataRef.current
        });
    };

    const style = {
        opacity: isDragging ? 0.3 : 1,
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none',
        touchAction: 'none'
    };

    return (
        <>
            <Box
                ref={dragRef}
                style={style}
                onMouseDown={handleMouseDown}
                sx={{
                    width: shape.size.width,
                    height: shape.size.height,
                    "&:hover": {opacity: 0.8},
                }}
            >
                <shape.component width="100%" height="100%"/>
            </Box>
            <DragPreview
                shape={shape}
                isDragging={isDragging}
                position={dragPosition}
                offset={dragOffset}
            />
        </>
    );
};

const ShapesSelector = ({canvasRef, onCreateShape}) => {
    const handleDragEnd = (dragData) => {
        const canvas = canvasRef.current;

        if (!canvas) return;

        const canvasRect = canvas.getBoundingClientRect();
        const isOverCanvas = dragData.clientX >= canvasRect.left &&
            dragData.clientX <= canvasRect.right &&
            dragData.clientY >= canvasRect.top &&
            dragData.clientY <= canvasRect.bottom;

        if (isOverCanvas) {
            console.log(dragData.data.offset)
            // Calculate position relative to canvas, accounting for drag offset
            const x = dragData.clientX - canvasRect.left - dragData.data.offset.x;
            const y = dragData.clientY - canvasRect.top - dragData.data.offset.y;


            onCreateShape({
                type: dragData.data.type,
                pos: [Math.max(0, x), Math.max(0, y)],
            });
        }
    };

    return (
        <Stack direction="row" spacing={2} padding={2}>
            {Object.entries(shapesRaw).map(([key, shape]) => (
                <Tooltip key={key} title={shape.tooltip} arrow>
                    <Box>
                        <DraggableShape
                            id={key}
                            shape={shape}
                            onDragEnd={handleDragEnd}
                        />
                    </Box>
                </Tooltip>
            ))}
        </Stack>
    );
};

export default ShapesSelector;