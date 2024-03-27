import { FaReact, FaRegImage } from "react-icons/fa";
import { PiFolderSimpleDuotone } from "react-icons/pi";
import { BsBraces, BsTextLeft } from "react-icons/bs";
import { IoCode } from "react-icons/io5";
import { BiLogoJavascript, BiLogoTypescript } from "react-icons/bi";
import { HiOutlineHashtag } from "react-icons/hi";
import { TbTextSize } from "react-icons/tb";
import { amber, blue, cyan, deepPurple } from "@mui/material/colors";

const reactIcon = <FaReact color={cyan[800]}/>;
const imageIcon = <FaRegImage color={deepPurple[400]}/>;

const fileTypeIcons = {
    folder: <PiFolderSimpleDuotone/>,
    unknown: <BsTextLeft/>,
    html: <IoCode color={amber[900]}/>,
    js: <BiLogoJavascript color={amber[400]}/>,
    ts: <BiLogoTypescript color={blue[500]}/>,
    json: <BsBraces color={amber[400]}/>,
    css: <HiOutlineHashtag color={cyan[600]}/>,
    jsx: reactIcon,
    tsx: reactIcon,
    bmp: imageIcon,
    png: imageIcon,
    jpg: imageIcon,
    jpeg: imageIcon,
    ico: imageIcon,
    ttf: <TbTextSize/>,
};

const getFileType = (filename) => filename?.includes(".") ? filename.split(".").pop() : null;

export { fileTypeIcons, getFileType }