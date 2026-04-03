import { Outlet } from "react-router-dom";
import { Stack } from "@mui/material";
import Navbar from "@/components/Navbar";
import RequireAuth from "@auth-kit/react-router/RequireAuth";

const App = () => {
    return (
        <RequireAuth fallbackPath="/auth">
            <Navbar/>
            <Outlet/>
        </RequireAuth>
    );
}

export default App;