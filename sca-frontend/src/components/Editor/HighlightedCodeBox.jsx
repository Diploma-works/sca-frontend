import { memo, useMemo, useState, useEffect } from "react";
import { alpha, Box, Button, Divider, Link, Menu, MenuItem, SvgIcon, Tooltip, useTheme } from "@mui/material";
import { yellow } from "@mui/material/colors";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import { useProblemsStateContext } from "../Problems";
import ScrollableContainer from "../ScrollableContainer";
import MonacoEditor from "@monaco-editor/react";

const HighlightedCodeBox = memo(({ language, children, onCodeChange }) => {
    const theme = useTheme();
    const [leaveSpaceForScrollbar, setLeaveSpaceForScrollbar] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const [editorInstance, setEditorInstance] = useState(null);
    const [decorations, setDecorations] = useState([]);
    const open = Boolean(anchorEl);

    const problems = useProblemsStateContext();
    const [showInfo, setShowInfo] = useState(false);
    const [showProblems, setShowProblems] = useState(true);

    const info = {
        user: {
            name: 'gramdel',
            link: 'http://github.com/gramdel',
        },
        time: '24.04.2024 18:00',
    };

    // Подсветка проблемных строк
    useEffect(() => {
        if (!editorInstance || !showProblems || !problems) return;

        const newDecorations = problems.flatMap(problem => {
            return {
                range: {
                    startLineNumber: problem.lines.start,
                    startColumn: 1,
                    endLineNumber: problem.lines.end,
                    endColumn: 1,
                },
                options: {
                    isWholeLine: true,
                    className: 'problem-line',
                    glyphMarginClassName: 'problem-glyph',
                    inlineClassName: 'problem-inline',
                    minimap: {
                        color: alpha(yellow[700], 0.2),
                        position: 1,
                    },
                    hoverMessage: {
                        value: `**${problem.description}**\n\n${problem.solution}`,
                        isTrusted: true,
                        supportThemeIcons: true,
                    },
                }
            };
        });

        const decorationIds = editorInstance.deltaDecorations(decorations, newDecorations);
        setDecorations(decorationIds);

        return () => {
            editorInstance.deltaDecorations(decorationIds, []);
        };
    }, [editorInstance, problems, showProblems]);

    const handleEditorDidMount = (editor, monaco) => {
        setEditorInstance(editor);
        
        // Добавляем кастомные стили для проблемных строк
        monaco.editor.defineTheme('custom-dark', {
            base: 'vs-dark',
            inherit: true,
            rules: [],
            colors: {
                'editor.lineHighlightBackground': '#2a2a2a',
                'editor.lineHighlightBorder': '#3a3a3a',
            },
        });

        monaco.editor.defineTheme('custom-light', {
            base: 'vs',
            inherit: true,
            rules: [],
            colors: {
                'editor.lineHighlightBackground': '#f5f5f5',
                'editor.lineHighlightBorder': '#e0e0e0',
            },
        });
    };

    const updated = (instance) => setLeaveSpaceForScrollbar(instance.state().hasOverflow.y);

    const handleClick = (e) => setAnchorEl(e.currentTarget);
    const handleClose = () => setAnchorEl(null);

    return (
        <ScrollableContainer
            events={{ updated }}
            style={{
                flex: 1,
                position: 'relative',
                height: '100%'
            }}
        >
            <Tooltip
                title="Настройки редактора"
                placement="bottom-end"
                PopperProps={{ modifiers: [{ name: 'offset', options: { offset: [0, parseInt(theme.spacing(1))] } }] }}
            >
                <Box sx={{
                    position: 'absolute',
                    right: 8,
                    top: 8,
                    zIndex: 2,
                    bgcolor: 'background.paper',
                    borderRadius: 1,
                }}>
                    <Button
                        size="small"
                        onClick={handleClick}
                        sx={{ minWidth: 32 }}
                    >
                        <MoreVertRoundedIcon fontSize="small" />
                    </Button>
                </Box>
            </Tooltip>

            <MonacoEditor
                height="100%"
                language={language}
                theme={theme.palette.mode === 'dark' ? 'vs-dark' : 'custom-light'}
                value={typeof children === 'string' ? children : children?.content || ''}
                onChange={onCodeChange}
                onMount={handleEditorDidMount}
                options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    wordWrap: 'on',
                    automaticLayout: true,
                    lineNumbers: 'on',
                    readOnly: !onCodeChange,
                    glyphMargin: true,
                    lineDecorationsWidth: 10,
                    renderLineHighlight: 'all',
                }}
            />

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
                onClose={handleClose}
            >
                <MenuItem onClick={() => {
                    setShowProblems(prev => !prev);
                    handleClose();
                }}>
                    <SvgIcon sx={{ width: 18, height: 18, mr: 1 }}>
                        {showProblems && <CheckRoundedIcon/>}
                    </SvgIcon>
                    Подсвечивать проблемы
                </MenuItem>
                <MenuItem onClick={() => {
                    setShowInfo(prev => !prev);
                    handleClose();
                }}>
                    <SvgIcon sx={{ width: 18, height: 18, mr: 1 }}>
                        {showInfo && <CheckRoundedIcon/>}
                    </SvgIcon>
                    Показывать авторов строк
                </MenuItem>
            </Menu>

            {/* Добавляем стили для подсветки проблем */}
            <style jsx global>{`
                .problem-line {
                    background: ${alpha(yellow[700], 0.2)};
                }
                .problem-glyph {
                    background: ${alpha(yellow[700], 0.5)};
                    width: 5px !important;
                    margin-left: 3px !important;
                }
                .problem-inline {
                    background: ${alpha(yellow[700], 0.1)};
                    border-bottom: 1px dashed ${alpha(yellow[700], 0.5)};
                }
            `}</style>
        </ScrollableContainer>
    );
});

export default HighlightedCodeBox;