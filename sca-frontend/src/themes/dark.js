import { createTheme } from "@mui/material";
import { grey } from "@mui/material/colors";

const globalStyles = createTheme({
    typography: {
        fontFamily: [
            'Montserrat',
            '-apple-system',
            'BlinkMacSystemFont',
            '"Segoe UI"',
            'Roboto',
            '"Helvetica Neue"',
            'Arial',
            'sans-serif',
            '"Apple Color Emoji"',
            '"Segoe UI Emoji"',
            '"Segoe UI Symbol"',
        ].join(','),
        button: {
            lineHeight: 'normal',
            textTransform: 'none',
        },
        subtitle2: {
            lineHeight: 'normal',
            fontWeight: 600,
        }
    },
    palette: {
        mode: 'dark',
        primary: {
            main: '#4489FF',
        },
        background: {
            default: 'black',
        },
        bg: {
            main: grey[800],
            dark: grey[700],
        },
    },
});

const darkTheme = createTheme(globalStyles, {
    components: {
        MuiTooltip: {
            defaultProps: {
                enterDelay: 300,
                enterNextDelay: 300,
                enterTouchDelay: 300,
            },
            styleOverrides: {
                tooltip: {
                    margin: '0 !important',
                    paddingLeft: globalStyles.spacing(1),
                    paddingRight: globalStyles.spacing(1),
                    paddingTop: globalStyles.spacing(4 / 8),
                    paddingBottom: globalStyles.spacing(4 / 8),
                    border: '1px solid',
                    borderColor: globalStyles.palette.divider,
                    backgroundColor: grey[900],
                    fontSize: globalStyles.typography.body2.fontSize,
                    boxShadow: `0 0 10px 2px ${globalStyles.palette.background.default}`,
                },
            },
        },
        MuiMenu: {
            styleOverrides: {
                paper: {
                    border: '1px solid',
                    borderColor: globalStyles.palette.divider,
                    boxShadow: `0 0 10px 2px ${globalStyles.palette.background.default}`,
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
                    ...globalStyles.typography.button,
                    minHeight: 0,
                    paddingLeft: globalStyles.spacing(1),
                    paddingRight: globalStyles.spacing(1),
                    paddingTop: globalStyles.spacing(4 / 8),
                    paddingBottom: globalStyles.spacing(4 / 8),
                }
            }
        }
    },
});

export default darkTheme;