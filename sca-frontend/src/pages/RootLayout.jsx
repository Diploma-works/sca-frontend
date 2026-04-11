import { Outlet } from "react-router-dom";
import RequireAuth from "@auth-kit/react-router/RequireAuth";
import { Navbar } from "@/components";

export const RootLayout = () => {
    return (
        <RequireAuth fallbackPath="/auth">
            <Navbar/>
            <Outlet/>
        </RequireAuth>
    );
}