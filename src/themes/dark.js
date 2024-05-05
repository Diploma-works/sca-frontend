import { createTheme } from "@mui/material";
import { grey } from "@mui/material/colors";

const dark = createTheme({
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
        altDivider: '#282828',
    },
});

export const darkTheme = createTheme(dark, {
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
            defaultProps: {
                enterDelay: 300,
                enterNextDelay: 300,
                enterTouchDelay: 300,
            },
            styleOverrides: {
                tooltip: {
                    margin: '0 !important',
                    paddingTop: 4,
                    paddingBottom: 4,
                    paddingLeft: 8,
                    paddingRight: 8,
                    fontSize: '0.875rem',
                    border: '1px solid',
                    borderColor: dark.palette.divider,
                    backgroundColor: grey[900],
                    boxShadow: `0 0 10px 2px ${dark.palette.background.default}`,
                },
            },
        },
        MuiMenu: {
            styleOverrides: {
                paper: {
                    border: '1px solid',
                    borderColor: dark.palette.divider,
                    boxShadow: `0 0 10px 2px ${dark.palette.background.default}`,
                },
                list: {
                    padding: 0,
                    backgroundColor: grey[900],
                },
            }
        },
        MuiMenuItem: {
            styleOverrides: {
                root: {
                    minHeight: 0,
                    paddingTop: 4,
                    paddingBottom: 4,
                    paddingLeft: 8,
                    paddingRight: 8,
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    lineHeight: 'normal',
                }
            }
        }
    },
});