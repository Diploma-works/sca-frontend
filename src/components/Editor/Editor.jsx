import { useState } from "react";

import { Menu, MenuItem, Stack, Typography, useTheme } from "@mui/material";

import EditorTabsRoot from "./EditorTabsRoot";
import { useTabsContext } from "../../contexts/TabsContext";
import ScrollableContainer from "../ScrollableContainer";
import HighlightedCodeBox from "./HighlightedCodeBox";
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

const Editor = () => {
    const theme = useTheme();
    const { tabs, moveTab, removeTab, activeTab, setActiveTab } = useTabsContext(); // TODO: переместить часть внутрь EditorTabsRoot

    const language = "jsx";
    const code = jsxCode;

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
            />}
            <ScrollableContainer style={{ flex: 1, backgroundColor: theme.palette.background.paper }}>
                <HighlightedCodeBox language={language}>
                    {code}
                </HighlightedCodeBox>
            </ScrollableContainer>
        </Stack>
    );
}

export default Editor;