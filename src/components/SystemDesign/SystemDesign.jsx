import {SidebarTool} from "../LeftSidebar";
import ScrollableContainer from "../ScrollableContainer";
import ShapesSelector from "./ShapesSelector";
import Scheme from "./Scheme";
import {
    Box,
    Grid,
    TextField,
    Stack,
    Typography,
    IconButton,
    InputBase,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import {dia, shapes} from "@joint/core";
import {useEffect, useRef, useMemo, useState} from "react";
import {shapes as customShapes} from "./shapes/shapes";
import {deleteBlockTool, connectTool, createResizeTool} from "./tools";

const TEXT_INPUTS = [
    "Функциональные требования",
    "Нефункциональные требования",
    "API",
    "Расчёт нагрузки",
];

const SystemDesign = (props) => {
    const canvasRef = useRef();
    const paperRef = useRef();
    const graphRef = useRef();
    const dragRef = useRef({ isDragging: false, startX: 0, startY: 0, originX: 0, originY: 0 });
    const [scale, setScale] = useState(1);
    const [editingComment, setEditingComment] = useState(null);
    const [editText, setEditText] = useState("");
    const editInputRef = useRef(null);

    const allShapes = useMemo(() => ({...shapes, ...customShapes}), []);

    const zoomIn = () => {
        const newScale = Math.min(scale + 0.1, 2);
        setScale(newScale);
        if (paperRef.current) {
            paperRef.current.scale(newScale);
        }
    };

    const zoomOut = () => {
        const newScale = Math.max(scale - 0.1, 0.5);
        setScale(newScale);
        if (paperRef.current) {
            paperRef.current.scale(newScale);
        }
    };

    const resetView = () => {
        setScale(1);
        if (paperRef.current) {
            paperRef.current.scale(1);
            paperRef.current.translate(0, 0);
        }
    };

    const startEditingComment = (elementView, evt) => {
        const model = elementView.model;
        if (model.get('type') !== 'custom.COMMENT') return;

        const bbox = elementView.getBBox();
        const canvasRect = canvasRef.current.getBoundingClientRect();
        const translate = paperRef.current.translate();

        setEditingComment({
            model,
            position: {
                left: bbox.x * scale + translate.tx,
                top: bbox.y * scale + translate.ty,
                width: bbox.width * scale,
                height: bbox.height * scale,
            }
        });
        setEditText(model.attr('label/text') || '');

        setTimeout(() => {
            if (editInputRef.current) {
                editInputRef.current.focus();
            }
        }, 0);
    };

    const finishEditingComment = () => {
        if (editingComment) {
            editingComment.model.attr('label/text', editText);
            setEditingComment(null);
            setEditText("");
        }
    };

    const handleEditKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            finishEditingComment();
        }
        if (e.key === 'Escape') {
            setEditingComment(null);
            setEditText("");
        }
    };

    function createShape(args) {
        const ShapeClass = customShapes.custom[args.type];
        if (ShapeClass) {
            const newShape = new ShapeClass();
            newShape.position(args.pos[0], args.pos[1]);
            newShape.addTo(graphRef.current);

            if (args.type === 'BALANCER') {
                newShape.toBack();
            }
        }
    }

    function elementClick(paper, cb) {
        return (el) => {
            paper.removeTools();
            cb(el);
        };
    }

    function blockClick(el) {
        const elementView = "model" in el ? el : el.findView(paperRef.current);
        if (elementView) {
            const type = elementView.model.get('type');
            const isComment = type === 'custom.COMMENT';
            const isBalancer = type === 'custom.BALANCER';

            let tools;
            if (isComment) {
                tools = [deleteBlockTool];
            } else if (isBalancer) {
                tools = [deleteBlockTool, createResizeTool()];
            } else {
                tools = [deleteBlockTool, connectTool];
            }

            elementView.addTools(new dia.ToolsView({tools}));
        }
    }

    function linkClick(el) {
        const elementView = "model" in el ? el : el.findView(paperRef.current);
        if (elementView) {
            elementView.addTools(new dia.ToolsView({tools: [deleteBlockTool]}));
        }
    }

    useEffect(() => {
        graphRef.current = new dia.Graph({}, {cellNamespace: allShapes});

        paperRef.current = new dia.Paper({
            el: canvasRef.current,
            model: graphRef.current,
            width: "100%",
            height: 600,
            cellViewNamespace: allShapes,
            snapLinks: false,
            highlighting: false,
            defaultLink: () => new shapes.standard.Link({
                attrs: {
                    line: {
                        strokeWidth: 2,
                    }
                }
            }),
            validateConnection: function(cellViewS, magnetS, cellViewT, magnetT) {
                const sourceType = cellViewS.model.get('type');
                const targetType = cellViewT?.model?.get('type');

                const excludedTypes = ['custom.BALANCER', 'custom.COMMENT'];
                if (excludedTypes.includes(sourceType) || excludedTypes.includes(targetType)) {
                    return false;
                }
                return true;
            },
        });

        paperRef.current.on("link:pointerclick", elementClick(paperRef.current, linkClick));
        paperRef.current.on("element:pointerclick", elementClick(paperRef.current, blockClick));
        paperRef.current.on("blank:pointerclick", paperRef.current.removeTools);
        paperRef.current.on("element:pointerdblclick", startEditingComment);

        paperRef.current.on("blank:pointerdown", (evt, x, y) => {
            const currentScale = paperRef.current.scale();
            dragRef.current = {
                isDragging: true,
                startX: evt.clientX,
                startY: evt.clientY,
                originX: paperRef.current.translate().tx,
                originY: paperRef.current.translate().ty,
            };
            canvasRef.current.style.cursor = "grabbing";
        });

        const handleMouseMove = (evt) => {
            if (dragRef.current.isDragging && paperRef.current) {
                const dx = evt.clientX - dragRef.current.startX;
                const dy = evt.clientY - dragRef.current.startY;
                paperRef.current.translate(
                    dragRef.current.originX + dx,
                    dragRef.current.originY + dy
                );
            }
        };

        const handleMouseUp = () => {
            if (dragRef.current.isDragging) {
                dragRef.current.isDragging = false;
                if (canvasRef.current) {
                    canvasRef.current.style.cursor = "default";
                }
            }
        };

        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);

        return () => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
            if (paperRef.current) {
                paperRef.current.remove();
            }
        };
    }, [allShapes]);

    return (
        <SidebarTool {...props}>
            <ScrollableContainer>
                <Box sx={{overflowX: "hidden", width: "1200px", p: 2, pt: 1}}>
                    <Grid sx={{mb: 2}} container spacing={2}>
                        {TEXT_INPUTS.map((label, index) => (
                            <Grid item xs={6} key={index}>
                                <Stack>
                                    <Typography variant="body2">{label}</Typography>
                                    <TextField
                                        sx={{width: "100%", mt: 1}}
                                        minRows={4}
                                        multiline
                                    />
                                </Stack>
                            </Grid>
                        ))}
                    </Grid>
                    <ShapesSelector canvasRef={canvasRef} onCreateShape={createShape}/>
                    <Box sx={{ position: 'relative' }}>
                        <Scheme canvasRef={canvasRef}/>
                        {editingComment && (
                            <InputBase
                                inputRef={editInputRef}
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                onBlur={finishEditingComment}
                                onKeyDown={handleEditKeyDown}
                                multiline
                                sx={{
                                    position: 'absolute',
                                    left: editingComment.position.left,
                                    top: editingComment.position.top,
                                    width: editingComment.position.width,
                                    height: editingComment.position.height,
                                    padding: '8px',
                                    fontSize: '12px',
                                    backgroundColor: 'background.paper',
                                    border: 2,
                                    borderColor: 'primary.main',
                                    borderRadius: 1,
                                    zIndex: 1000,
                                    '& .MuiInputBase-input': {
                                        padding: 0,
                                        textAlign: 'center',
                                    }
                                }}
                            />
                        )}
                        <Stack
                            direction="row"
                            alignItems="center"
                            spacing={0.5}
                            sx={{
                                position: 'absolute',
                                top: 8,
                                right: 8,
                                backgroundColor: 'background.paper',
                                borderRadius: 1,
                                padding: 0.5,
                                border: 1,
                                borderColor: 'divider',
                            }}
                        >
                            <IconButton onClick={zoomOut} size="small">
                                <RemoveIcon fontSize="small" />
                            </IconButton>
                            <Typography variant="body2" sx={{minWidth: 40, textAlign: 'center'}}>
                                {Math.round(scale * 100)}%
                            </Typography>
                            <IconButton onClick={zoomIn} size="small">
                                <AddIcon fontSize="small" />
                            </IconButton>
                            <IconButton onClick={resetView} size="small">
                                <RestartAltIcon fontSize="small" />
                            </IconButton>
                        </Stack>
                    </Box>
                </Box>
            </ScrollableContainer>
        </SidebarTool>
    );
};

export default SystemDesign;