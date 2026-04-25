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
    Snackbar,
    Alert,
    Tooltip,
    CircularProgress,
    useMediaQuery,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import SaveIcon from "@mui/icons-material/Save";
import {dia, shapes} from "@joint/core";
import {useEffect, useRef, useMemo, useState, useCallback} from "react";
import {shapes as customShapes} from "./shapes/shapes";
import {deleteBlockTool, connectTool, createResizeTool} from "./tools";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

const TEXT_INPUTS = [
    {label: "Функциональные требования", key: "functional_req"},
    {label: "Нефункциональные требования", key: "non_functional_req"},
    {label: "API", key: "api_notes"},
    {label: "Расчёт нагрузки", key: "load_calc"},
];

function getBrowserId() {
    let id = localStorage.getItem("sca_browser_id");
    if (!id) {
        id = crypto.randomUUID();
        localStorage.setItem("sca_browser_id", id);
    }
    return id;
}

const SystemDesign = (props) => {
    const canvasRef = useRef();
    const paperRef = useRef();
    const graphRef = useRef();
    const dragRef = useRef({isDragging: false, startX: 0, startY: 0, originX: 0, originY: 0});
    const autoSaveTimer = useRef(null);

    const [scale, setScale] = useState(1);
    const [editingComment, setEditingComment] = useState(null);
    const [editText, setEditText] = useState("");
    const editInputRef = useRef(null);

    const [fields, setFields] = useState({
        functional_req: "",
        non_functional_req: "",
        api_notes: "",
        load_calc: "",
    });

    const fieldsRef = useRef(fields);
    useEffect(() => {
        fieldsRef.current = fields;
    }, [fields]);

    const [toast, setToast] = useState({open: false, severity: "success", message: ""});
    const [saving, setSaving] = useState(false);

    const isWide = useMediaQuery("(min-width:1200px)");

    const allShapes = useMemo(() => ({...shapes, ...customShapes}), []);
    const browserId = useMemo(() => getBrowserId(), []);

    const save = useCallback(async () => {
        setSaving(true);
        try {
            const umlDiagram = graphRef.current ? graphRef.current.toJSON() : null;
            const res = await fetch(`${API_URL}/api/system-design`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    browser_id: browserId,
                    ...fieldsRef.current,
                    uml_diagram: umlDiagram,
                }),
            });
            if (!res.ok) throw new Error("server error");
            setToast({open: true, severity: "success", message: "Изменения сохранены"});
        } catch {
            setToast({open: true, severity: "error", message: "Ошибка при сохранении"});
        } finally {
            setSaving(false);
        }
    }, [browserId]);

    const scheduleAutoSave = useCallback(() => {
        if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
        autoSaveTimer.current = setTimeout(save, 10_000);
    }, [save]);

    const handleFieldChange = (key, value) => {
        setFields((prev) => ({...prev, [key]: value}));
        scheduleAutoSave();
    };

    const handleManualSave = () => {
        if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
        save();
    };

    const zoomIn = () => {
        const newScale = Math.min(scale + 0.1, 2);
        setScale(newScale);
        if (paperRef.current) paperRef.current.scale(newScale);
    };

    const zoomOut = () => {
        const newScale = Math.max(scale - 0.1, 0.5);
        setScale(newScale);
        if (paperRef.current) paperRef.current.scale(newScale);
    };

    const resetView = () => {
        setScale(1);
        if (paperRef.current) {
            paperRef.current.scale(1);
            paperRef.current.translate(0, 0);
        }
    };

    const startEditingComment = (elementView) => {
        const model = elementView.model;
        if (model.get("type") !== "custom.COMMENT") return;

        const bbox = elementView.getBBox();
        const translate = paperRef.current.translate();

        setEditingComment({
            model,
            position: {
                left: bbox.x * scale + translate.tx,
                top: bbox.y * scale + translate.ty,
                width: bbox.width * scale,
                height: bbox.height * scale,
            },
        });
        setEditText(model.attr("label/text") || "");

        setTimeout(() => {
            if (editInputRef.current) editInputRef.current.focus();
        }, 0);
    };

    const finishEditingComment = () => {
        if (editingComment) {
            editingComment.model.attr("label/text", editText);
            setEditingComment(null);
            setEditText("");
        }
    };

    const handleEditKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            finishEditingComment();
        }
        if (e.key === "Escape") {
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
            if (args.type === "BALANCER") newShape.toBack();
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
            const type = elementView.model.get("type");
            const tools =
                type === "custom.COMMENT"
                    ? [deleteBlockTool]
                    : type === "custom.BALANCER"
                    ? [deleteBlockTool, createResizeTool()]
                    : [deleteBlockTool, connectTool];
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
            defaultLink: () =>
                new shapes.standard.Link({attrs: {line: {strokeWidth: 2}}}),
            validateConnection(cellViewS, _magnetS, cellViewT) {
                const excluded = ["custom.BALANCER", "custom.COMMENT"];
                return (
                    !excluded.includes(cellViewS.model.get("type")) &&
                    !excluded.includes(cellViewT?.model?.get("type"))
                );
            },
        });

        paperRef.current.on("link:pointerclick", elementClick(paperRef.current, linkClick));
        paperRef.current.on("element:pointerclick", elementClick(paperRef.current, blockClick));
        paperRef.current.on("blank:pointerclick", paperRef.current.removeTools.bind(paperRef.current));
        paperRef.current.on("element:pointerdblclick", startEditingComment);

        paperRef.current.on("blank:pointerdown", (evt) => {
            dragRef.current = {
                isDragging: true,
                startX: evt.clientX,
                startY: evt.clientY,
                originX: paperRef.current.translate().tx,
                originY: paperRef.current.translate().ty,
            };
            canvasRef.current.style.cursor = "grabbing";
        });

        graphRef.current.on("change add remove", scheduleAutoSave);

        const handleMouseMove = (evt) => {
            if (dragRef.current.isDragging && paperRef.current) {
                paperRef.current.translate(
                    dragRef.current.originX + evt.clientX - dragRef.current.startX,
                    dragRef.current.originY + evt.clientY - dragRef.current.startY
                );
            }
        };
        const handleMouseUp = () => {
            if (dragRef.current.isDragging) {
                dragRef.current.isDragging = false;
                if (canvasRef.current) canvasRef.current.style.cursor = "default";
            }
        };

        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);

        fetch(`${API_URL}/api/system-design?browser_id=${browserId}`)
            .then((r) => r.json())
            .then((data) => {
                if (!data) return;
                setFields({
                    functional_req: data.functional_req || "",
                    non_functional_req: data.non_functional_req || "",
                    api_notes: data.api_notes || "",
                    load_calc: data.load_calc || "",
                });
                if (data.uml_diagram && graphRef.current) {
                    graphRef.current.fromJSON(data.uml_diagram);
                }
            })
            .catch(() => {});

        return () => {
            if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
            if (paperRef.current) paperRef.current.remove();
        };
    }, [allShapes]); 

    const saveAction = {
        title: saving ? "Сохранение..." : "Сохранить",
        icon: saving ? <CircularProgress size={14} color="inherit"/> : <SaveIcon/>,
        props: {onClick: handleManualSave, disabled: saving},
    };

    return (
        <SidebarTool {...props} additionalActions={[saveAction]} hideSettings>
            <Box sx={{position: "relative", flex: 1, overflow: "hidden", display: "flex", flexDirection: "column"}}>
                <ScrollableContainer>
                    <Box sx={{overflowX: "hidden", width: "100%", p: 2, pt: 1}}>
                        <Grid sx={{mb: 2}} container spacing={2}>
                            {TEXT_INPUTS.map(({label, key}) => (
                                <Grid item xs={12} sm={isWide ? 6 : 12} key={key}>
                                    <Stack>
                                        <Typography variant="body2">{label}</Typography>
                                        <TextField
                                            sx={{width: "100%", mt: 1}}
                                            minRows={4}
                                            multiline
                                            value={fields[key]}
                                            onChange={(e) => handleFieldChange(key, e.target.value)}
                                        />
                                    </Stack>
                                </Grid>
                            ))}
                        </Grid>

                        <ShapesSelector canvasRef={canvasRef} onCreateShape={createShape} />

                        <Box sx={{position: "relative", mt: 2}}>
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
                                        position: "absolute",
                                        left: editingComment.position.left,
                                        top: editingComment.position.top,
                                        width: editingComment.position.width,
                                        height: editingComment.position.height,
                                        padding: "8px",
                                        fontSize: "12px",
                                        backgroundColor: "background.paper",
                                        border: 2,
                                        borderColor: "primary.main",
                                        borderRadius: 1,
                                        zIndex: 1000,
                                        "& .MuiInputBase-input": {padding: 0, textAlign: "center"},
                                    }}
                                />
                            )}

                            <Stack
                                direction="row"
                                alignItems="center"
                                spacing={0.5}
                                sx={{
                                    position: "absolute",
                                    top: 8,
                                    right: 8,
                                    backgroundColor: "background.paper",
                                    borderRadius: 1,
                                    padding: 0.5,
                                    border: 1,
                                    borderColor: "divider",
                                }}
                            >
                                <IconButton onClick={zoomOut} size="small">
                                    <RemoveIcon fontSize="small"/>
                                </IconButton>
                                <Typography variant="body2" sx={{minWidth: 40, textAlign: "center"}}>
                                    {Math.round(scale * 100)}%
                                </Typography>
                                <IconButton onClick={zoomIn} size="small">
                                    <AddIcon fontSize="small"/>
                                </IconButton>
                                <IconButton onClick={resetView} size="small">
                                    <RestartAltIcon fontSize="small"/>
                                </IconButton>
                            </Stack>
                        </Box>
                    </Box>
                </ScrollableContainer>

            </Box>

            <Snackbar
                open={toast.open}
                autoHideDuration={3000}
                onClose={() => setToast((t) => ({...t, open: false}))}
                anchorOrigin={{vertical: "bottom", horizontal: "right"}}
            >
                <Alert
                    severity={toast.severity}
                    variant="filled"
                    onClose={() => setToast((t) => ({...t, open: false}))}
                    sx={{width: "100%"}}
                >
                    {toast.message}
                </Alert>
            </Snackbar>
        </SidebarTool>
    );
};

export default SystemDesign;
