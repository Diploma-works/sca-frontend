import { useCallback, useEffect, useRef, useState } from "react";

const useHorizontalResizing = (prevWidth, updatePrevWidth) => {
    /* State variables for resizing logic  */
    const [isResizing, setIsResizing] = useState(false);
    const [width, setWidth] = useState(prevWidth);
    const [startPos, setStartPos] = useState({ x: 0, width: 0 });

    /* Ref for resizable element */
    const resizableElementRef = useRef(null);

    /* Resizing logic */
    const startResizing = useCallback(({ clientX }) => {
        setIsResizing(true);
        setStartPos({ x: clientX, width: resizableElementRef.current.offsetWidth });
    }, []);

    const resize = useCallback(({ clientX }) => {
        if (!isResizing) {
            return;
        }
        const newWidth = startPos.width + clientX - startPos.x;
        const { minWidth, maxWidth } = window.getComputedStyle(resizableElementRef.current);
        if (newWidth < 0 || newWidth < parseFloat(minWidth) || newWidth > parseFloat(maxWidth)) {
            return;
        }
        setWidth(newWidth);
        updatePrevWidth(newWidth);
    }, [isResizing, startPos, updatePrevWidth]);

    const endResizing = useCallback(() => setIsResizing(false), []);

    /* Handlers for mouse events */
    const handleMouseDown = useCallback((e) => {
        e.preventDefault();
        startResizing(e);
    }, [startResizing]);

    const handleMouseMove = useCallback((e) => resize(e), [resize]);

    const handleMouseUp = useCallback(() => endResizing(), [endResizing]);

    /* Handlers for touch events */
    const handleTouchStart = useCallback((e) => {
        // e.preventDefault(); TODO: понять, нужно ли это
        startResizing(e.touches[0]);
    }, [startResizing]);

    const handleTouchMove = useCallback((e) => resize(e.touches[0]), [resize]);

    const handleTouchEnd = useCallback(() => endResizing(), [endResizing]);

    /* Effects for setting up window event listeners */
    useEffect(() => {
        if (isResizing) {
            window.addEventListener("mousemove", handleMouseMove);
            window.addEventListener("touchmove", handleTouchMove);
            window.addEventListener("mouseup", handleMouseUp);
            window.addEventListener("touchend", handleTouchEnd);
            document.body.style.cursor = "ew-resize";
            return () => {
                window.removeEventListener("mousemove", handleMouseMove);
                window.removeEventListener("touchmove", handleTouchMove);
                window.removeEventListener("mouseup", handleMouseUp);
                window.removeEventListener("touchend", handleTouchEnd);
                document.body.style.cursor = "auto";
            }
        }
    }, [isResizing, handleMouseMove, handleTouchMove, handleMouseUp, handleTouchEnd]);

    /* Listeners for resize handle */
    const listeners = {
        onMouseDown: handleMouseDown,
        onTouchStart: handleTouchStart,
    }

    return { width, listeners, isResizing, resizableElementRef };
}

export default useHorizontalResizing;