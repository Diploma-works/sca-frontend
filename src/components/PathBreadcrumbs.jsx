import { useMemo } from "react";

import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { Breadcrumbs } from "@mui/material";
import { useTabsContext } from "../contexts/TabsContext";

const PathBreadcrumbs = () => {
    const { activeTab } = useTabsContext();

    const children = useMemo(() => activeTab?.label.split("/").map((pathElement, index) =>
        <span key={index}>{pathElement}</span>
    ), [activeTab]);

    return (
        <Breadcrumbs
            separator={<NavigateNextIcon sx={{ width: 18, height: 18 }}/>}
            sx={{
                px: 1,
                py: 4 / 8,
                height: 26,
                fontWeight: 500,
                fontSize: '0.875em',
                lineHeight: 'normal',
                textWrap: 'nowrap',
                userSelect: 'none',
                '.MuiBreadcrumbs-ol': {
                    flexWrap: 'nowrap',
                },
                '.MuiBreadcrumbs-separator': {
                    mx: 4 / 8,
                },
            }}
        >
            {children}
        </Breadcrumbs>
    );
}

export default PathBreadcrumbs;