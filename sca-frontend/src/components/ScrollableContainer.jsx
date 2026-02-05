import { forwardRef } from "react";
import { useTheme } from "@mui/material";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";

// TODO: пофиксить clickScroll или убрать его
const ScrollableContainer = forwardRef(({ children, style, events }, ref) => {
    const theme = useTheme();

    return (
        <OverlayScrollbarsComponent
            ref={ref}
            style={style}
            events={events}
            options={{
                scrollbars: {
                    theme: theme.palette.mode === "light" ? "os-theme-dark os-custom" : "os-theme-light os-custom",
                    clickScroll: true,
                }
            }}
        >
            {children}
        </OverlayScrollbarsComponent>
    );
});

export default ScrollableContainer;