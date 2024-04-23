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
        divider: '#282828',
    },
});

export const darkTheme = createTheme(dark,{
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
                    //height: 28,
                    margin: '0 !important',
                    paddingLeft: 8,
                    paddingRight: 8,
                    //display: 'flex',
                    //alignItems: 'center',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    backgroundColor: grey[900],
                    border: '1px solid',
                    borderColor: grey[800],
                    boxShadow: '0 0 10px 2px #0a0a0a',
                    borderRadius: 0,
                },
                tooltipPlacementRight: {
                    marginLeft: '14px !important',
                }
            },
        },
        MuiMenu: {
            styleOverrides: {
                paper: {
                    border: `1px solid ${dark.palette.divider}`,
                    boxShadow: `0 0 10px 2px ${dark.palette.background.default}`,
                    //boxShadow: 'none',
                },
                list: {
                    padding: 0,
                    backgroundColor: dark.palette.background.paper,
                    //backgroundColor: grey[100],
                },
            }
        },
        MuiMenuItem: {
            styleOverrides: {
                root: {
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