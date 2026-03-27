import { createTheme, inputLabelClasses, outlinedInputClasses, selectClasses } from "@mui/material";
import { grey } from "@mui/material/colors";
import { ruRU } from "@mui/material/locale";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";

export const spacing = 8;

export const theme = createTheme(
    {
        spacing,
        cssVariables: {
            colorSchemeSelector: "class"
        },
        colorSchemes: {
            light: {
                palette: {
                    background: {
                        default: '#f5f6fa',
                    },
                    primary: {
                        main: '#4489FF',
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
                },
            },
            dark: {
                palette: {
                    background: {
                        default: '#000000',
                    },
                    primary: {
                        main: '#4489FF',
                    },
                    bg: {
                        main: grey[800],
                        dark: grey[700],
                    },
                },
            },
        },
        components: {
            MuiTooltip: {
                defaultProps: {
                    enterDelay: 300,
                    enterNextDelay: 300,
                    enterTouchDelay: 300,
                },
                styleOverrides: {
                    tooltip: ({ theme }) => ({
                        margin: '0 !important',
                        padding: `${theme.spacing(0.5)} ${theme.spacing(1)}`,
                        backgroundColor: theme.vars.palette.background.paper,
                        backgroundImage: theme.vars.overlays[2],
                        border: `1px solid ${theme.vars.palette.divider}`,
                        boxShadow: `0 0 10px 2px ${theme.vars.palette.background.default}`,
                        //boxShadow: theme.vars.shadows[1], TODO: use custom MUI shadows?
                        color: theme.vars.palette.text.primary,
                        fontSize: theme.typography.body2.fontSize,
                    }),
                },
            },
            MuiMenu: {
                styleOverrides: {
                    list: {
                        padding: 0,
                    },
                },
            },
            MuiMenuItem: {
                styleOverrides: {
                    root: ({ theme }) => ({
                        ...theme.typography.button,
                        minHeight: 0,
                        padding: `${theme.spacing(0.5)} ${theme.spacing(1)}`,
                    })
                } ,
            },
            MuiPopover: {
                defaultProps: {
                    slotProps: {
                        paper: {
                            elevation: 2,
                        }
                    }
                },
                styleOverrides: {
                    paper: ({ theme }) => ({
                        border: `1px solid ${theme.vars.palette.divider}`,
                        boxShadow: `0 0 10px 2px ${theme.vars.palette.background.default}`,
                    }),
                },
            },
            MuiTextField: {
                styleOverrides: {
                    root: ({ theme }) => ({
                        variants: [
                            {
                                props: { select: true, size: "xs" },
                                style: {
                                    [`& .${outlinedInputClasses.root} .${outlinedInputClasses.input}.${selectClasses.select}`]: {
                                        padding: `${theme.spacing(0.5)} ${theme.spacing(1)}`,
                                        paddingRight: `calc(${theme.spacing(1)}*2 + 11px)`,
                                    },
                                    [`.${selectClasses.icon}`]: {
                                        right: 3,
                                    },
                                },
                            },
                        ],
                        /*
                        [`& .${inputLabelClasses.root}`]: {
                            marginLeft: 2,
                        },
                        [`& .${outlinedInputClasses.notchedOutline} legend`]: {
                            marginLeft: 2,
                        },
                        */
                    }),
                },
            },
            /*
            MuiButton: {
                defaultProps: {
                    disableElevation: true,
                },
                styleOverrides: {
                    root: ({ theme }) => ({
                        borderRadius: 999,
                        variants: [
                            {
                                props: { size: 'uniSmall' },
                                style: {
                                    padding: theme.spacing(1 / 2),
                                    minWidth: 'auto',
                                },
                            },
                            {
                                props: { size: 'uniMedium' },
                                style: {
                                    padding: theme.spacing(1),
                                    minWidth: 'auto',
                                },
                            },
                        ]
                    }),
                },
            },
            MuiMenu: {
                styleOverrides: {
                    paper: ({ theme }) => ({
                        borderRadius: `calc(4 * ${theme.vars.shape.borderRadius})`,
                    }),
                },
            },
            MuiOutlinedInput: {
                styleOverrides: {
                    root: ({ theme }) => ({
                        borderRadius: `calc(5 * ${theme.vars.shape.borderRadius})`,
                        variants: [
                            {
                                props: { multiline: true },
                                style: {
                                    paddingLeft: theme.spacing(2),
                                    paddingRight: theme.spacing(2),
                                },
                            },
                        ]
                    }),
                    input: ({ theme }) => ({
                        variants: [
                            {
                                props: { multiline: false },
                                style: {
                                    paddingLeft: theme.spacing(2),
                                    paddingRight: theme.spacing(2),
                                },
                            },
                        ]
                    }),
                },
            },
            MuiTextField: {
                styleOverrides: {
                    root: ({ theme }) => ({
                        variants: [
                            {
                                props: { select: true, size: "small" },
                                style: {
                                    [`& .${outlinedInputClasses.root} .${outlinedInputClasses.input}.${selectClasses.select}`]: {
                                        paddingRight: 43,
                                    },
                                    [`.${selectClasses.icon}`]: {
                                        right: 11,
                                    },
                                },
                            },
                        ],
                        [`& .${inputLabelClasses.root}`]: {
                            marginLeft: 2,
                        },
                        [`& .${outlinedInputClasses.notchedOutline} legend`]: {
                            marginLeft: 2,
                        },
                    }),
                },
            },
            MuiPaper: {
                defaultProps: {
                    elevation: 0,
                },
                styleOverrides: {
                    root: ({ theme }) => ({
                        borderRadius: `calc(4 * ${theme.vars.shape.borderRadius})`,
                    }),
                },
            },
            */
            MuiSelect: {
                defaultProps: {
                    IconComponent: ExpandMoreRoundedIcon
                },
            },
        },
        typography: {
            fontFamily: [
                'Montserrat Variable',
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
    },
    ruRU,
);