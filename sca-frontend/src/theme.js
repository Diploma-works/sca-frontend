import {
    createTheme,
    dividerClasses,
    listItemIconClasses, listItemTextClasses,
    listSubheaderClasses,
    outlinedInputClasses,
    selectClasses
} from "@mui/material";
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
            MuiListItemButton: {
                styleOverrides: {
                    dense: ({ theme }) => ({
                        padding: `${theme.spacing(0.5)} ${theme.spacing(1.5)}`,
                    }),
                }
            },
            MuiMenu: {
                styleOverrides: {
                    list: ({ theme }) => ({
                        padding: `${theme.spacing(0.5)}`,
                        [`& > .${dividerClasses.root}`]: {
                            margin: `${theme.spacing(0.5)} 0 !important`,
                            zIndex: 1,
                            position: 'relative',
                        },
                        [`.${listSubheaderClasses.root}`]: {
                            backgroundImage: theme.vars.overlays[2],
                            font: theme.vars.font.caption,
                            fontWeight: theme.typography.fontWeightMedium,
                            paddingTop: theme.spacing(1),
                            paddingBottom: theme.spacing(0.5),
                            paddingLeft: theme.spacing(1),
                            paddingRight: theme.spacing(1),
                            marginTop: `calc(0px - ${theme.spacing(0.5)})`,
                        }
                    }),
                },
            },
            MuiMenuItem: {
                styleOverrides: {
                    root: ({ theme }) => ({
                        font: theme.vars.font.body2,
                        minHeight: 0,
                        padding: `${theme.spacing(0.5)} ${theme.spacing(1)}`,
                        borderRadius: `calc(0.5 * ${theme.vars.shape.borderRadius})`,
                        [`.${listItemIconClasses.root}`]: {
                            minWidth: 20,
                            marginLeft: `calc(0px - ${theme.spacing(0.5)})`,
                            marginRight: theme.spacing(1),
                            justifyContent: 'center',
                            color: theme.vars.palette.text.secondary,
                        },
                        [`.${listItemTextClasses.primary}`]: {
                            font: theme.vars.font.body2,
                        },
                    }),
                },
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
                                        fontSize: theme.typography.button.fontSize,
                                        padding: `calc(${theme.spacing(0.5)} - 1px) calc(${theme.spacing(1)} - 1px)`,
                                        paddingRight: `calc(${theme.spacing(1)}*2 + 11px)`,
                                    },
                                    [`.${selectClasses.icon}`]: {
                                        right: 3,
                                    },
                                },
                            },
                        ],
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