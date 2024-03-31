import { createTheme } from "@mui/material";
import { grey } from "@mui/material/colors";

export const lightTheme = createTheme({
    typography: {
        fontFamily: 'Montserrat',
    },
    palette: {
        mode: 'light',
        primary: {
            main: '#4489FF',
        },
        background: {
            default: '#f5f6fa'
        },
        bg: {
            main: grey[300],
            dark: grey[400],
        },
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
                    scrollbarColor: 'rgba(0, 0, 0, 0.16) transparent',
                    '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
                        backgroundColor: 'transparent',
                        width: 10,
                        height: 10,
                    },
                    '&::-webkit-scrollbar-thumb:hover, & *::-webkit-scrollbar-thumb:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.24)',
                    },
                    '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
                        backgroundColor: 'rgba(0, 0, 0, 0.16)',
                    },
                    '&::-webkit-scrollbar-corner, & *::-webkit-scrollbar-corner': {
                        backgroundColor: 'transparent',
                    },
                },
            },
        },
        MuiTooltip: {
            styleOverrides: {
                tooltip: {
                    height: 28,
                    paddingLeft: 8,
                    paddingRight: 8,
                    display: 'flex',
                    alignItems: 'center',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    backgroundColor: grey[300],
                    color: '#283646',
                    boxShadow: '0 0 10px 2px #f5f6fa',
                },
                tooltipPlacementRight: {
                    marginLeft: '14px !important',
                }
            },
        },
    },
});