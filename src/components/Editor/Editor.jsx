import { Stack, useTheme } from "@mui/material";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { darcula, prism } from "react-syntax-highlighter/dist/esm/styles/prism"

import EditorTabsRoot from "./EditorTabsRoot";
import { useTabsContext } from "../../contexts/TabsContext";
import ScrollableContainer from "../ScrollableContainer";
import jsxCode from "./jsxCode";

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
            />}
            <ScrollableContainer style={{ flex: 1, backgroundColor: theme.palette.background.paper }}>
                <SyntaxHighlighter
                    language="jsx"
                    showLineNumbers
                    style={theme.palette.mode === "dark" ? darcula : prism}
                    customStyle={{
                        margin: 0,
                        padding: 4,
                        background: 'transparent',
                        overflow: 'visible',
                    }}
                >
                    {jsxCode}
                </SyntaxHighlighter>
            </ScrollableContainer>
        </Stack>
    );
}

export default Editor;