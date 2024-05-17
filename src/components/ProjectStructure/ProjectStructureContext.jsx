import { createContext, useContext, useState } from "react";

const ProjectStructureContext = createContext();

const ProjectStructureContextProvider = ({ defaultExpandedItems = [], defaultSelectedItems = "", children }) => {
    const [expandedItems, setExpandedItems] = useState(defaultExpandedItems);
    const [selectedItems, setSelectedItems] = useState(defaultSelectedItems);

    return (
        <ProjectStructureContext.Provider value={{
            expandedItems,
            setExpandedItems,
            selectedItems,
            setSelectedItems
        }}>
            {children}
        </ProjectStructureContext.Provider>
    );
};

const useProjectStructureContext = () => {
    const context = useContext(ProjectStructureContext);
    if (!context) {
        throw new Error("useProjectStructureContext must be used within a ProjectStructureContextProvider");
    }
    return context;
};

export { ProjectStructureContextProvider, useProjectStructureContext };