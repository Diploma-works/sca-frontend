import { createTheme } from "@mui/material";
import { createColor } from "./utils";

export const lightTheme = createTheme({
    typography: {
        fontFamily: "Montserrat",
    },
    palette: {
        mode: "light",
        primary: {
            main: '#4489FF',
        },
        background: {
            default: '#f5f6fa'
        },
        bg: createColor('#e0e0e0'),
        text: {
            primary: '#283646',
            secondary: '#5b5d6c',
            disabled: '#939ea8'
        },
        divider: '#e0e0e0',
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
                        backgroundColor: 'rgba(0, 0, 0, 0.24)',
                    },
                    "&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb": {
                        backgroundColor: 'rgba(0, 0, 0, 0.16)',
                    },
                    "&::-webkit-scrollbar-corner, & *::-webkit-scrollbar-corner": {
                        backgroundColor: 'transparent',
                    },
                },
            },
        },
    },
});