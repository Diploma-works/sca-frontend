import { createTheme } from "@mui/material";
import { createColor } from "./utils";

export const darkTheme = createTheme({
    typography: {
        fontFamily: "Montserrat",
    },
    palette: {
        mode: "dark",
        primary: {
            main: '#4489FF',
        },
        background: {
            default: '#0a0a0a'
        },
        bg: createColor('#e0e0e0'),
        divider: '#282828',
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    scrollbarColor: "#6b6b6b #2b2b2b", // TODO: поправить цвета для FireFox
                    "&::-webkit-scrollbar, & *::-webkit-scrollbar": {
                        backgroundColor: 'transparent',
                        width: 10,
                        height: 10,
                    },
                    "&::-webkit-scrollbar-thumb:hover, & *::-webkit-scrollbar-thumb:hover": {
                        backgroundColor: 'rgba(255, 255, 255, 0.24)',
                    },
                    "&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb": {
                        backgroundColor: 'rgba(255, 255, 255, 0.16)',
                    },
                    "&::-webkit-scrollbar-corner, & *::-webkit-scrollbar-corner": {
                        backgroundColor: 'transparent',
                    },
                },
            },
        },
    },
});