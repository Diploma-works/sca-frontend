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
} from "@mui/material";
import {dia, shapes} from "@joint/core";
import {useEffect, useRef, useMemo} from "react";
import {shapes as customShapes} from "./shapes/shapes";
import {deleteBlockTool, connectTool} from "./tools";

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

    const allShapes = useMemo(() => ({...shapes, ...customShapes}), []);

    function createShape(args) {
        const ShapeClass = customShapes.custom[args.type];
        if (ShapeClass) {
            const newShape = new ShapeClass();
            newShape.position(args.pos[0], args.pos[1]);
            newShape.addTo(graphRef.current);
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
            elementView.addTools(
                new dia.ToolsView({tools: [deleteBlockTool, connectTool]})
            );
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
        });

        paperRef.current.on("link:pointerclick", elementClick(paperRef.current, linkClick));
        paperRef.current.on("element:pointerclick", elementClick(paperRef.current, blockClick));
        paperRef.current.on("blank:pointerclick", paperRef.current.removeTools);

        // Cleanup on unmount
        return () => {
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
                    <Scheme canvasRef={canvasRef} />
                </Box>
            </ScrollableContainer>
        </SidebarTool>
    );
};

export default SystemDesign;