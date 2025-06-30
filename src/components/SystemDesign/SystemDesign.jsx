import { SidebarTool } from "../LeftSidebar";
import ScrollableContainer from "../ScrollableContainer";
import ShapesSelector from "./ShapesSelector";
import { Box, Grid, TextField, Stack, Typography } from "@mui/material";
import { dia } from '@joint/core';
import { useEffect, useRef } from "react";
import { shapes } from "./shapes/shapes";
import { useSchemeDrag } from "./UseSchemeDrag";

const SystemDesign = (props) => {
    const textInputs = ['Функциональные требования', 'Нефункциональные требования', 'API', 'Расчёт нагрузки']
    const canvasRef = useRef(null);
    const paperRef = useRef();

    useSchemeDrag(canvasRef, paperRef);

    useEffect(() => {
        const graph = new dia.Graph({}, { cellNamespace: shapes });
        paperRef.current = new dia.Paper({
            el: canvasRef.current,
            model: graph,
            width: '100%',
            height: 600,
            cellViewNamespace: shapes,
            snapLinks: true,
            highlighting: false,
        });
    }, [props.mode]);

    return (
        <SidebarTool {...props}>
            <ScrollableContainer>
                <Box sx={{ overflowX: 'hidden', width: '1200px', p: 2, pt: 1 }}>
                    <Grid sx={{ mb: 2 }} container spacing={2}>
                        {textInputs.map((label, index) => (
                            <Grid item xs={6} key={index}>
                                <Stack>
                                    <Typography variant="body2">{label}</Typography>
                                    <TextField
                                        sx={{ width: '100%', mt: 1 }}
                                        minRows={4}
                                        multiline
                                    />
                                </Stack>
                            </Grid>
                        ))}
                    </Grid>
                    <ShapesSelector />
                    <div ref={canvasRef} sx={{ pt: 2 }}></div>
                </Box>

            </ScrollableContainer>
        </SidebarTool>
    );
}

export default SystemDesign;