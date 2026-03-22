import { useRef } from "react";
import { Box, Divider, Fade, Popover, Typography, useColorScheme } from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import { Editor } from "@monaco-editor/react";

export const ProjectInfo = ({ anchorRef, open, setOpen }) => {
    const { mode } = useColorScheme();
    const editorRef = useRef(null);

    const handleClose = () => setOpen(false);

    const handleMount = (editor, monaco) => {
        editorRef.current = editor;
        editor.focus();
        editor.onKeyDown((e) => {
            const shouldBlock = editor.getContribution("editor.contrib.suggestController")?.model?.state === 0;
            if (e.keyCode === monaco.KeyCode.Enter && shouldBlock) {
                e.preventDefault();
                e.stopPropagation();
            }
        });
        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyF, () => null);
    }

    const handleEnter = () => {
        editorRef.current?.layout();
        editorRef.current?.trigger("keyboard", "editor.action.triggerSuggest", {});
    }

    return (
        <Popover
            anchorEl={() => anchorRef?.current}
            open={open}
            onClose={handleClose}
            anchorOrigin={{ vertical: "top", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
            marginThreshold={8}
            slots={{ transition: Fade }}
            slotProps={{
                paper: {
                    sx: {
                        width: 700,
                        mt: "-9px",
                        ml: "10px"
                    },
                },
                transition: {
                    onEntered: handleEnter,
                },
            }}
        >
            <Box sx={(theme) => ({
                m: 1,
                px: 1,
                py: 0.5,
                height: 32,
                position: "relative",
                overflow: "hidden",
                border: `1px solid ${theme.vars.palette.divider}`,
                borderRadius: 1,
                "&:hover": { borderColor: "text.primary" },
                "&:focus-within": {
                    borderColor: "primary.main",
                    boxShadow: `0 0 0 1px ${theme.vars.palette.primary.main}`,
                },
            })}>
                <Editor
                    theme={mode === 'dark' ? 'sca-dark' : 'sca-light'}
                    language="SCAQL"
                    options={{
                        fontSize: 16,
                        lineNumbers: "off",
                        folding: false,
                        lineDecorationsWidth: 0,
                        lineNumbersMinChars: 0,
                        scrollBeyondLastLine: false,
                        overviewRulerBorder: false,
                        overviewRulerLanes: 0,
                        hideCursorInOverviewRuler: true,
                        scrollbar: {
                            vertical: "hidden",
                            horizontal: "hidden",
                            handleMouseWheel: false,
                        },
                        minimap: { enabled: false },
                        renderLineHighlight: "none",
                        contextmenu: false,
                        automaticLayout: true,
                        wordBasedSuggestions: "off",
                        fixedOverflowWidgets: true,
                    }}
                    onMount={handleMount}
                />
                <SearchRoundedIcon sx={{
                    position: "absolute",
                    top: 3,
                    right: 5,
                    color: "text.secondary"
                }}/>
            </Box>
            <Divider/>
            <Typography px={1} py={0.5} color="textDisabled">Ничего не найдено</Typography>
        </Popover>
    );
}