import { forwardRef } from "react";
import { useColorScheme } from "@mui/material";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";

// TODO: пофиксить clickScroll или убрать его
const ScrollableContainer = forwardRef(({ children, style, events }, ref) => {
    const { mode } = useColorScheme();

    return (
        <OverlayScrollbarsComponent
            ref={ref}
            style={style}
            events={events}
            options={{
                scrollbars: {
                    theme: mode === "light" ? "os-theme-dark os-custom" : "os-theme-light os-custom",
                    clickScroll: true,
                }
            }}
        >
            {children}
        </OverlayScrollbarsComponent>
    );
});

export default ScrollableContainer;