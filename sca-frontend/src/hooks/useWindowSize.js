import { useEffect, useState } from "react";

const useWindowSize = () => {
    const [size, setSize] = useState({ innerWidth: window.innerWidth, innerHeight: window.innerHeight });
    const { innerWidth, innerHeight } = size;

    useEffect(() => {
        const updateSize = () => {
            setSize({ innerWidth: window.innerWidth, innerHeight: window.innerHeight });
        }

        window.addEventListener("resize", updateSize);
        return () => window.removeEventListener("resize", updateSize);
    }, []);

    return { innerWidth, innerHeight };
}

export default useWindowSize;