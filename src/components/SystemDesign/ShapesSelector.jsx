import { Stack, Tooltip } from "@mui/material";
import Client from "./shapes/Client.svg";
import DB from "./shapes/DB.svg";
import Queue from "./shapes/Queue.svg";
import Service from "./shapes/Sevice.svg";
import Balancer from "./shapes/Balancer.svg";
import SvgWrapper from './SvgWrapper';

const ShapesSelector = () => {
    return (
        <Stack direction="row" spacing={2} padding={2}>
            <Tooltip title="Client" arrow>
                <div style={{ width: 96, height: 96 }}>
                    <SvgWrapper src={Client} width="100%" height="100%" />
                </div>
            </Tooltip>

            <Tooltip title="Database" arrow>
                <div style={{ width: 96, height: 96 }}>
                    <SvgWrapper src={DB} width="100%" height="100%" />
                </div>
            </Tooltip>

            {/* Add other SVGs similarly */}
        </Stack>
    );
};

export default ShapesSelector;