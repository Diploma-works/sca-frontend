import { useEffect, useRef } from "react";

export function useSchemeDrag(wrapperRef, paperRef) {
  const isDraggingRef = useRef(false);
  const startOffsetCanvas = useRef({ x: 0, y: 0 });
  const startOffsetMouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper || !paperRef.current) return;

    const startDrag = (event) => {
      if (wrapper.lastChild !== event.target) return;

      const { tx, ty } = paperRef.current.translate();
      startOffsetCanvas.current = { x: tx, y: ty };
      startOffsetMouse.current = { x: event.offsetX, y: event.offsetY };
      isDraggingRef.current = true;
    };

    const endDrag = () => {
      isDraggingRef.current = false;
    };

    const moveContainerChild = (event) => {
      if (!isDraggingRef.current) return;

      const currentX =
        startOffsetCanvas.current.x -
        startOffsetMouse.current.x +
        event.offsetX;
      const currentY =
        startOffsetCanvas.current.y -
        startOffsetMouse.current.y +
        event.offsetY;
      paperRef.current.translate(currentX, currentY);
    };

    const moveContainerChildWithScroll = (event) => {
      event.stopPropagation();

      const { tx: startX, ty: startY } = paperRef.current.translate();

      let currentX;
      let currentY;

      if (event.shiftKey) {
        currentX = startX - event.deltaY;
        currentY = startY;
      } else {
        currentX = startX - event.deltaX;
        currentY = startY - event.deltaY;
      }

      paperRef.current.translate(currentX, currentY);
    };

    wrapper.addEventListener("pointerdown", startDrag);
    window.addEventListener("pointerup", endDrag);
    wrapper.addEventListener("mousemove", moveContainerChild);
    wrapper.addEventListener("wheel", moveContainerChildWithScroll);

    return () => {
      wrapper.removeEventListener("pointerdown", startDrag);
      window.removeEventListener("pointerup", endDrag);
      wrapper.removeEventListener("mousemove", moveContainerChild);
      wrapper.removeEventListener("wheel", moveContainerChildWithScroll);
    };
  }, [wrapperRef, paperRef]);
}
