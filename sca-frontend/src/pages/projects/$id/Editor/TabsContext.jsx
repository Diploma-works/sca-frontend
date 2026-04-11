import { createContext, useCallback, useContext, useReducer } from "react";
import { arrayMove } from "@dnd-kit/sortable";

const TabsStateContext = createContext();
const TabsUpdateContext = createContext();

const tabsReducer = (state, action) => {
    switch (action.type) {
        case "ADD_TAB":
            const existingTab = state.tabs.find((tab) => tab.id === action.tab.id);
            if (existingTab) {
                return { ...state, activeTab: { ...existingTab, path: action.tab.path } };
            }
            return { ...state, tabs: [...state.tabs, action.tab], activeTab: action.tab };
        case "MOVE_TAB":
            return { ...state, tabs: arrayMove(state.tabs, action.from, action.to) };
        case "REMOVE_TAB":
            if (action.id === state.activeTab.id) {
                const indexToDelete = state.tabs.findIndex((tab) => tab.id === state.activeTab.id);
                const tabs = [...state.tabs];
                tabs.splice(indexToDelete, 1);
                return { tabs, activeTab: indexToDelete === 0 ? tabs[0] : state.tabs[indexToDelete - 1] };
            }
            return { ...state, tabs: state.tabs.filter((tab) => tab.id !== action.id) };
        case "SET_ACTIVE_TAB":
            const activeTab = state.tabs.find((tab) => tab.id === action.activeTab.id);
            return { ...state, activeTab };
        default:
            return state;
    }
};

const TabsContextProvider = ({ defaultTabs = [], defaultActiveTab = null, children }) => {
    const [state, dispatch] = useReducer(tabsReducer, { tabs: defaultTabs, activeTab: defaultActiveTab });

    const addTab = useCallback((tab) => dispatch({ type: "ADD_TAB", tab }), [dispatch]);
    const moveTab = useCallback((from, to) => dispatch({ type: "MOVE_TAB", from, to }), [dispatch]);
    const removeTab = useCallback((id) => dispatch({ type: "REMOVE_TAB", id }), [dispatch]);
    const setActiveTab = useCallback((activeTab) => dispatch({ type: "SET_ACTIVE_TAB", activeTab }), [dispatch]);

    return (
        <TabsStateContext.Provider value={state}>
            <TabsUpdateContext.Provider value={{
                addTab,
                moveTab,
                removeTab,
                setActiveTab
            }}>
                {children}
            </TabsUpdateContext.Provider>
        </TabsStateContext.Provider>
    );
};

const useTabsStateContext = () => {
    const context = useContext(TabsStateContext);
    if (!context) {
        throw new Error("useTabsStateContext must be used within a TabsContextProvider");
    }
    return context;
};

const useTabsUpdateContext = () => {
    const context = useContext(TabsUpdateContext);
    if (!context) {
        throw new Error("useTabsUpdateContext must be used within a TabsContextProvider");
    }
    return context;
};

const useTabsContext = () => ({ ...useTabsStateContext(), ...useTabsUpdateContext() });

export { TabsContextProvider, useTabsContext, useTabsStateContext, useTabsUpdateContext };