import { createTheme } from "@mui/material";

const defaultTheme = createTheme();

export const createColor = (mainColor) => defaultTheme.palette.augmentColor({ color: { main: mainColor } });