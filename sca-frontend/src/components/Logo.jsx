import { Link } from "react-router-dom";
import { Typography } from "@mui/material";

export const Logo = () => {
    return (
        <Typography
            component={Link}
            to="/"
            variant="h5"
            fontWeight="bold"
            color="primary"
            sx={{ textDecoration: "none" }}
        >
            SCA
        </Typography>
    );
}