import { memo, useRef, useState } from "react";

import { alpha, Box, Button, Link, Menu, MenuItem, SvgIcon, Tooltip, useTheme } from "@mui/material";
import { yellow } from "@mui/material/colors";

import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";

import { createElement, Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { darcula, prism } from "react-syntax-highlighter/dist/cjs/styles/prism";

import ScrollableContainer from "../ScrollableContainer";

const CodeLine = memo(({ node, stylesheet, useInlineStyles, info, problem }) => {
    const popperRef = useRef(null);
    const [popperProps, setPopperProps] = useState({ popperRef })

    const handleMouseMove = (event) => {
        if (!popperRef.current) {
            const offsetX = event.clientX - event.currentTarget.getBoundingClientRect().x;
            setPopperProps({ ...popperProps, modifiers: [{ name: 'offset', options: { offset: [offsetX, 0] } }] });
        }
    };

    const element = problem ? (
        createElement({
            node: { ...node, properties: { ...node.properties, onMouseMove: handleMouseMove } },
            stylesheet,
            style: {
                display: "inline-block",
                background: alpha(yellow[700], 0.2)
            },
            useInlineStyles
        })
    ) : (
        createElement({
            node,
            stylesheet,
            useInlineStyles
        })
    );

    return (
        <span style={{ display: 'block' }}>
            {info && (
                <Link
                    href={info.user.link}
                    target="_blank"
                    sx={{
                        px: 1,
                        cursor: 'pointer',
                        display: 'inline-block',
                        bgcolor: 'background.paper',
                        borderRight: '1px solid',
                        borderColor: 'divider'
                    }}
                >
                    {info.user.name + " " + info.time}
                </Link>
            )}
            {problem ? (
                <Tooltip
                    title={problem}
                    placement={"bottom-start"}
                    leaveDelay={300}
                    PopperProps={popperProps}
                >
                    {element}
                </Tooltip>
            ) : (
                element
            )}
        </span>
    );
});

const HighlightedCodeBox = memo(({ language, children }) => {
    const theme = useTheme();

    const [leaveSpaceForScrollbar, setLeaveSpaceForScrollbar] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const [showInfo, setShowInfo] = useState(false);
    const [showProblems, setShowProblems] = useState(true);
    const [highlightLines, setHighlightLines] = useState([0, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 150]);

    const info = {
        user: {
            name: 'gramdel',
            link: 'http://github.com/gramdel',
        },
        time: '24.04.2024 18:00',
    };

    const problem = (
        <>
            В данном блоке кода есть дефект!<br/>
            Предлагаемый вариант исправления:<br/>
            TEST<br/>
            TEST<br/>
            TEST<br/>
            TEST
        </>
    );

    const updated = (instance) => setLeaveSpaceForScrollbar(instance.state().hasOverflow.y);

    const handleClick = (e) => {
        e.stopPropagation();
        setAnchorEl(e.currentTarget);
    };

    const handleClose = () => setAnchorEl(null);

    const renderer = ({ rows, stylesheet, useInlineStyles }) => rows.map((node, index) => (
        <CodeLine
            key={index}
            node={node}
            stylesheet={stylesheet}
            useInlineStyles={useInlineStyles}
            info={showInfo && info}
            problem={showProblems && highlightLines.includes(index) && problem}
        />
    ));

    return (
        <ScrollableContainer
            events={{ updated }}
            style={{
                flex: 1,
                transform: 'translateX(0)',
                backgroundColor: theme.palette.background.paper,
            }}
        >
            <Tooltip
                title="Внешний вид"
                placement="bottom-end"
                PopperProps={{ modifiers: [{ name: 'offset', options: { offset: [0, 8] } }] }}
            >
                <Box sx={{
                    position: 'fixed',
                    right: 0,
                    mt: 1,
                    mr: leaveSpaceForScrollbar ? 2 : 1,
                    color: 'text.secondary',
                    bgcolor: 'background.paper',
                    borderRadius: 1,
                }}>
                    <Button
                        color="inherit"
                        disableElevation
                        variant={open ? "contained" : "text"}
                        onClick={handleClick}
                        sx={{
                            p: 2 / 8,
                            minWidth: 0,
                            display: 'flex',
                        }}
                    >
                        <MoreVertRoundedIcon sx={{ width: 16, height: 16 }}/>
                    </Button>
                </Box>
            </Tooltip>
            <Menu
                open={open}
                anchorEl={anchorEl}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                marginThreshold={null}
                onClose={handleClose}
            >
                <MenuItem onClick={() => setShowProblems((prevState) => !prevState)}>
                    <SvgIcon sx={{ width: 18, height: 18, mr: 1 }}>
                        {showProblems && <CheckRoundedIcon/>}
                    </SvgIcon>
                    Подсвечивать проблемы
                </MenuItem>
                <MenuItem onClick={() => setShowInfo((prevState) => !prevState)}>
                    <SvgIcon sx={{ width: 18, height: 18, mr: 1 }}>
                        {showInfo && <CheckRoundedIcon/>}
                    </SvgIcon>
                    Показывать авторов строк
                </MenuItem>
            </Menu>
            <Box display="flex">
                <SyntaxHighlighter
                    language={language}
                    renderer={renderer}
                    showLineNumbers
                    style={theme.palette.mode === "dark" ? darcula : prism}
                    lineNumberStyle={{ minWidth: '3em' }}
                    customStyle={{
                        flex: 1,
                        margin: 0,
                        padding: 0,
                        background: 'transparent',
                        overflow: 'visible',
                    }}
                >
                    {children}
                </SyntaxHighlighter>
            </Box>
        </ScrollableContainer>
    );
});

export default HighlightedCodeBox;