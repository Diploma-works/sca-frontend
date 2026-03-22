import { FaReact, FaRegImage } from "react-icons/fa";
import { PiFolderSimpleDuotone } from "react-icons/pi";
import { BsBraces, BsTextLeft } from "react-icons/bs";
import { IoCode } from "react-icons/io5";
import { BiLogoJavascript, BiLogoTypescript } from "react-icons/bi";
import { HiOutlineHashtag } from "react-icons/hi";
import { TbTextSize } from "react-icons/tb";
import { amber, blue, cyan, deepPurple } from "@mui/material/colors";

const fileTypeIcons = {
    unknown: <BsTextLeft/>,
    folder: <PiFolderSimpleDuotone/>,
    image: <FaRegImage color={deepPurple[400]}/>,
    html: <IoCode color={amber[900]}/>,
    js: <BiLogoJavascript color={amber[400]}/>,
    ts: <BiLogoTypescript color={blue[500]}/>,
    json: <BsBraces color={amber[400]}/>,
    css: <HiOutlineHashtag color={cyan[600]}/>,
    jsx: <FaReact color={cyan[800]}/>,
    tsx: <FaReact color={cyan[800]}/>,
    ttf: <TbTextSize/>,
};

const imageFileTypes = ["bmp", "png", "jpg", "jpeg", "ico"];

const getFileType = (filename) => {
    if (!filename || !filename.includes(".")) {
        return null;
    }
    const fileType = filename.split(".").pop();
    return imageFileTypes.includes(fileType) ? "image" : fileType;
}

export { fileTypeIcons, getFileType }