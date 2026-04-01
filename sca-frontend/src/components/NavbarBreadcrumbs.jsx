import { Breadcrumbs, breadcrumbsClasses, styled } from "@mui/material";
import NavigateNextRoundedIcon from "@mui/icons-material/NavigateNextRounded";

export const NavbarBreadcrumbs = styled((props) => (
    <Breadcrumbs {...props} separator={<NavigateNextRoundedIcon fontSize="small"/>}/>
))(({ theme }) => ({
    [`.${breadcrumbsClasses.ol}`]: {
        flexWrap: "nowrap",
    },
    [`.${breadcrumbsClasses.li}`]: {
        color: theme.vars.palette.text.primary,
    },
    [`.${breadcrumbsClasses.separator}`]: {
        margin: `0 ${theme.spacing(0.5)}`,
    },
}));