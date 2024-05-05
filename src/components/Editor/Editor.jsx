import { Stack } from "@mui/material";

import EditorTabsRoot from "./EditorTabsRoot";
import { useTabsContext } from "../../contexts/TabsContext";
import HighlightedCodeBox from "./HighlightedCodeBox";
//import jsxCode from "./jsxCode";

const Editor = () => {
    const { tabs, moveTab, removeTab, activeTab, setActiveTab } = useTabsContext(); // TODO: переместить часть внутрь EditorTabsRoot

    const language = "jsx";
    //const code = jsxCode;
    const code = null; // TODO: разобраться, почему происходят тормоза

    return (
        <Stack sx={{
            flex: 1,
            borderRadius: 1,
            overflow: 'hidden',
        }}>
            {tabs && <EditorTabsRoot
                tabs={tabs}
                moveTab={moveTab}
                removeTab={removeTab}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
            />}
            <HighlightedCodeBox language={language}>
                {code}
            </HighlightedCodeBox>
        </Stack>
    );
}

export default Editor;