import { useCallback, useEffect, useRef, useState } from "react";

const useHorizontalResizing = (getMinWidth, getMaxWidth, prevWidth, updatePrevWidth) => {
    /* State variables for resizing logic  */
    const [isResizing, setIsResizing] = useState(false);
    const [width, setWidth] = useState(prevWidth);
    const [startPos, setStartPos] = useState({ x: 0, width: 0 });

    /* Refs for resizable element and resize handle */
    const resizableElementRef = useRef(null);
    const resizeHandleRef = useRef(null);

    /* Resizing logic */
    const startResizing = useCallback(({ clientX }) => {
        setIsResizing(true);
        setStartPos({ x: clientX, width: resizableElementRef.current.offsetWidth });
    }, []);

    const resize = useCallback(({ clientX }) => {
        if (!isResizing) {
            return;
        }
        const newWidth = startPos.width + clientX - startPos.x; // TODO: если делать RightSidebar, то инвертировать
        if (newWidth >= getMinWidth() && newWidth <= getMaxWidth()) {
            setWidth(newWidth);
            updatePrevWidth(newWidth);
        }
    }, [isResizing, getMaxWidth, getMinWidth, startPos, updatePrevWidth]);

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
        e.preventDefault();
        startResizing(e.touches[0]);
    }, [startResizing]);

    const handleTouchMove = useCallback((e) => resize(e.touches[0]), [resize]);

    const handleTouchEnd = useCallback(() => endResizing(), [endResizing]);

    /* Handler for window resize */
    const handleResize = useCallback(() => {
        setWidth((prevWidth) => Math.min(prevWidth, getMaxWidth()));
    }, [getMaxWidth]);

    /* Effect for updating prev width */
    useEffect(() => {
        if (width && width !== prevWidth) {
            updatePrevWidth(width);
        }
    }, [width, prevWidth, updatePrevWidth]);

    /* Effects for setting up event listeners */
    useEffect(() => {
        const resizeHandle = resizeHandleRef?.current;
        if (resizeHandle) {
            resizeHandle.addEventListener("mousedown", handleMouseDown);
            resizeHandle.addEventListener("touchstart", handleTouchStart);
            return () => {
                resizeHandle.removeEventListener("mousedown", handleMouseDown);
                resizeHandle.removeEventListener("touchstart", handleTouchStart);
            };
        }
    }, [handleMouseDown, handleTouchStart]);

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

    useEffect(() => {
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [handleResize]);

    return { width, resizeableElementRef: resizableElementRef, resizeHandleRef };
}

export default useHorizontalResizing;