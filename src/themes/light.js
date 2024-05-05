import { createTheme } from "@mui/material";
import { grey } from "@mui/material/colors";

const light = createTheme({
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
        altDivider: '#e0e0e0',
    }
});

export const lightTheme = createTheme(light, {
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
                    color: light.palette.text.primary,
                    border: '1px solid',
                    borderColor: light.palette.divider,
                    backgroundColor: 'white',
                    boxShadow: `0 0 10px 2px ${light.palette.background.default}`,
                },
            },
        },
        MuiMenu: {
            styleOverrides: {
                paper: {
                    border: '1px solid',
                    borderColor: light.palette.divider,
                    boxShadow: `0 0 10px 2px ${light.palette.background.default}`,
                },
                list: {
                    padding: 0,
                }
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