import { createTheme } from "@mui/material";
import { grey } from "@mui/material/colors";

export const darkTheme = createTheme({
    typography: {
        fontFamily: 'Montserrat',
    },
    palette: {
        mode: 'dark',
        primary: {
            main: '#4489FF',
        },
        background: {
            default: '#0a0a0a'
        },
        bg: {
            main: grey[800],
            dark: grey[700],
        },
        divider: '#282828',
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    scrollbarColor: 'rgba(255, 255, 255, 0.16) transparent',
                    '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
                        backgroundColor: 'transparent',
                        width: 10,
                        height: 10,
                    },
                    '&::-webkit-scrollbar-thumb:hover, & *::-webkit-scrollbar-thumb:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.24)',
                    },
                    '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
                        backgroundColor: 'rgba(255, 255, 255, 0.16)',
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
                    backgroundColor: grey[800],
                    boxShadow: '0 0 10px 2px #0a0a0a',
                },
                tooltipPlacementRight: {
                    marginLeft: '14px !important',
                }
            },
        },
    },
});