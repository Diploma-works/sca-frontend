import { memo, useRef, useState } from "react";

import { alpha, Box, Link, Tooltip, useTheme } from "@mui/material";
import { yellow } from "@mui/material/colors";

import { createElement, Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { darcula, prism } from "react-syntax-highlighter/dist/cjs/styles/prism";

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
                    enterDelay={300}
                    leaveDelay={300}
                    enterNextDelay={300}
                    enterTouchDelay={300}
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

    const [showInfo, setShowInfo] = useState(false);
    const [showProblems, setShowProblems] = useState(true);
    const [highlightLines, setHighlightLines] = useState([20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 150]);

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
    );
});

export default HighlightedCodeBox;