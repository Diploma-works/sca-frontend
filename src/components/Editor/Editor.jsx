import { useRef, useState } from "react";

import { alpha, Box, Menu, MenuItem, Stack, Tooltip, Typography, useTheme } from "@mui/material";
import { yellow } from "@mui/material/colors";

import { createElement, Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { darcula, prism } from "react-syntax-highlighter/dist/esm/styles/prism"

import EditorTabsRoot from "./EditorTabsRoot";
import { useTabsContext } from "../../contexts/TabsContext";
import ScrollableContainer from "../ScrollableContainer";
import jsxCode from "./jsxCode";

// TODO: убрать совсем или дописать
const ContextMenu = () => {
    //const [contextMenu, setContextMenu] = useState(null);
    const [contextMenu, setContextMenu] = useState({ mouseX: 342 + 2, mouseY: 154 - 6, });

    const handleContextMenu = (event) => {
        /*
        {
        mouseX: 342 + 2,
        mouseY: 154 - 6,
    }*/

        event.preventDefault();
        console.log(event.clientX, event.clientY)
        setContextMenu(
            contextMenu === null
                ? {
                    mouseX: event.clientX + 2,
                    mouseY: event.clientY - 6,
                }
                : // repeated contextmenu when it is already open closes it with Chrome 84 on Ubuntu
                  // Other native context menus might behave different.
                  // With this behavior we prevent contextmenu from the backdrop to re-locale existing context menus.
                null,
        );
    };

    const handleClose = () => {
        //setContextMenu(null);
    };

    return (
        <div
            // onContextMenu={handleContextMenu}
            style={{ cursor: 'context-menu' }}
        >
            <Typography>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam ipsum purus,
                bibendum sit amet vulputate eget, porta semper ligula. Donec bibendum
                vulputate erat, ac fringilla mi finibus nec. Donec ac dolor sed dolor
                porttitor blandit vel vel purus. Fusce vel malesuada ligula. Nam quis
                vehicula ante, eu finibus est. Proin ullamcorper fermentum orci, quis finibus
                massa. Nunc lobortis, massa ut rutrum ultrices, metus metus finibus ex, sit
                amet facilisis neque enim sed neque. Quisque accumsan metus vel maximus
                consequat. Suspendisse lacinia tellus a libero volutpat maximus.
            </Typography>
            <Menu
                open={false}
                //open={contextMenu !== null}
                onClose={handleClose}
                anchorReference="anchorPosition"
                anchorPosition={
                    contextMenu !== null
                        ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
                        : undefined
                }
            >
                Варианты действий:
                <MenuItem onClick={handleClose}>Copy</MenuItem>
                <MenuItem onClick={handleClose}>Print</MenuItem>
                <MenuItem onClick={handleClose}>Highlight</MenuItem>
                <MenuItem onClick={handleClose}>Email</MenuItem>
            </Menu>
        </div>
    );
}

const CodeLine = ({ node, stylesheet, useInlineStyles, showTooltip }) => {
    const popperRef = useRef(null);
    const [popperProps, setPopperProps] = useState({ popperRef })

    const handleMouseMove = (event) => {
        if (!popperRef.current) {
            const offsetX = event.clientX - event.currentTarget.getBoundingClientRect().x;
            setPopperProps({ ...popperProps, modifiers: [{ name: 'offset', options: { offset: [offsetX, 0] } }] });
        }
    };

    return (
        showTooltip ?
            <Tooltip
                //open={true}
                title={<>В данной строке кода ошибка!<br/>Предлагаемый вариант
                    исправления: <br/>TEST<br/>TEST<br/>TEST<br/>TEST</>}
                placement={"bottom-start"}
                enterDelay={300}
                enterNextDelay={300}
                enterTouchDelay={300}
                leaveDelay={300}
                PopperProps={popperProps}
            >
                <span
                    onMouseMove={handleMouseMove}
                >
                {createElement({
                    node,
                    stylesheet,
                    style: {
                        display: 'block',
                        background: alpha(yellow[700], 0.2)
                    },
                    useInlineStyles,
                })}
                </span>
            </Tooltip> :
            createElement({
                node,
                stylesheet,
                useInlineStyles,
            })
    );
}

const CustomRenderer = ({ rows, stylesheet, useInlineStyles }) => {
    const [highlightLines, setHighlightLines] = useState([0, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30]);

    return rows.map((node, index) =>
        <CodeLine
            key={index}
            node={node}
            stylesheet={stylesheet}
            useInlineStyles={useInlineStyles}
            showTooltip={highlightLines.includes(index)}
        />
    );
}

const Editor = () => {
    const theme = useTheme();
    const { tabs, moveTab, removeTab, activeTab, setActiveTab } = useTabsContext();

    return (
        <Stack sx={{
            flex: 1,
            overflow: 'hidden',
        }}>
            {tabs && <EditorTabsRoot
                tabs={tabs}
                moveTab={moveTab}
                removeTab={removeTab}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                wrapLines={true}
            />}
            <ScrollableContainer style={{ flex: 1, backgroundColor: theme.palette.background.paper }}>
                <Box display="flex">
                    <SyntaxHighlighter
                        language="jsx"
                        showLineNumbers
                        wrapLines
                        style={theme.palette.mode === "dark" ? darcula : prism}
                        customStyle={{
                            flex: 1,
                            margin: 0,
                            padding: 0,
                            background: 'transparent',
                            overflow: 'visible',
                        }}
                        renderer={CustomRenderer}
                    >
                        {jsxCode}
                    </SyntaxHighlighter>
                </Box>
            </ScrollableContainer>
        </Stack>
    );
}

export default Editor;