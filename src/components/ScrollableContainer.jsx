import { useTheme } from "@mui/material";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";

// TODO: пофиксить clickScroll или убрать его
const ScrollableContainer = ({ children, style }) => {
    const theme = useTheme();

    return (
        <OverlayScrollbarsComponent
            options={{
                scrollbars: {
                    theme: theme.palette.mode === "light" ? "os-theme-dark os-custom" : "os-theme-light os-custom",
                    clickScroll: true,
                }
            }}
            style={style}
        >
            {children}
        </OverlayScrollbarsComponent>
    );
}

export default ScrollableContainer;