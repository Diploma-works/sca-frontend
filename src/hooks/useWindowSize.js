import { useEffect, useState } from "react";

const useWindowSize = () => {
    const [size, setSize] = useState({});
    const { innerWidth, innerHeight } = size;

    const updateSize = () => {
        setSize({ innerWidth: window.innerWidth, innerHeight: window.innerHeight });
    }

    useEffect(() => {
        updateSize();
        window.addEventListener("resize", updateSize);
        return () => window.removeEventListener("resize", updateSize);
    }, []);

    return { innerWidth, innerHeight };
}

export default useWindowSize;