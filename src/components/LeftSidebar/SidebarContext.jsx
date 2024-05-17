import { createContext, useContext, useState } from "react";

const SidebarStateContext = createContext();
const SidebarUpdateContext = createContext();

const SidebarContextProvider = ({ defaultActiveTool = null, children }) => {
    const [activeTool, setActiveTool] = useState(defaultActiveTool);

    return (
        <SidebarStateContext.Provider value={activeTool}>
            <SidebarUpdateContext.Provider value={setActiveTool}>
                {children}
            </SidebarUpdateContext.Provider>
        </SidebarStateContext.Provider>
    );
};

const useSidebarStateContext = () => {
    const context = useContext(SidebarStateContext);
    if (context === undefined) {
        throw new Error("useSidebarStateContext must be used within a SidebarContextProvider");
    }
    return context;
};

const useSidebarUpdateContext = () => {
    const context = useContext(SidebarUpdateContext);
    if (context === undefined) {
        throw new Error("useSidebarUpdateContext must be used within a SidebarContextProvider");
    }
    return context;
};

const useSidebarContext = () => [useSidebarStateContext(), useSidebarUpdateContext()];

export { SidebarContextProvider, useSidebarContext, useSidebarStateContext, useSidebarUpdateContext };