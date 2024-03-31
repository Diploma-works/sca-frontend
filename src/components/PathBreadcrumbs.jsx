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
            separator={<NavigateNextIcon sx={{ width: 16, height: 16 }}/>}
            sx={{
                px: 1,
                py: 4 / 8,
                height: 24,
                fontWeight: 500,
                fontSize: 'small',
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