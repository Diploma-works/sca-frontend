import { Outlet } from "react-router-dom";
import { Divider, Stack } from "@mui/material";
import Navbar from "../components/Navbar";

const AppLayout = ({ mode, switchMode }) => {
    return (
        <Stack sx={{ height: '100dvh' }}>
            <Navbar mode={mode} switchMode={switchMode} />
            <Divider />
            <Outlet /> { }
        </Stack>
    );
};

export default AppLayout;