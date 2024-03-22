import { createTheme } from "@mui/material";

export const defaultTheme = createTheme();
export const createColor = (mainColor) => defaultTheme.palette.augmentColor({ color: { main: mainColor } });