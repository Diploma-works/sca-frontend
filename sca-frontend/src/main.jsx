import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

import "@fontsource-variable/montserrat";
import "overlayscrollbars/overlayscrollbars.css";
import "./styles.css";
import "./monaco/init.js";

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <App/>
    </StrictMode>,
);