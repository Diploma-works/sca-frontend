import { createContext, useContext, useState } from "react";

const TabsContext = createContext();

const TabsProvider = ({ defaultTabs, children }) => {
    const [tabs, setTabs] = useState(defaultTabs ?? null);
    return (
        <TabsContext.Provider value={[tabs, setTabs]}>
            {children}
        </TabsContext.Provider>
    );
}

const useTabs = () => {
    const context = useContext(TabsContext);
    if (context === undefined) {
        throw new Error("useTabs must be within TabsProvider");
    }
    return context;
}

export { TabsProvider, useTabs };