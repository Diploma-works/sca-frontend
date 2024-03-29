import { createContext, useCallback, useContext, useReducer } from "react";
import { arrayMove } from "@dnd-kit/sortable";

const TabsContext = createContext();

const tabsReducer = (state, action) => {
    switch (action.type) {
        case "ADD_TAB":
            const existingTab = state.tabs.find((tab) => tab.id === action.tab.id);
            if (existingTab) {
                return { ...state, activeTab: existingTab };
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

const TabsContextProvider = ({ tabs, activeTab, children }) => {
    const [state, dispatch] = useReducer(tabsReducer, { tabs: tabs ?? [], activeTab: activeTab ?? null });

    const addTab = useCallback((tab) => dispatch({ type: "ADD_TAB", tab }), [dispatch]);
    const moveTab = useCallback((from, to) => dispatch({ type: "MOVE_TAB", from, to }), [dispatch]);
    const removeTab = useCallback((id) => dispatch({ type: "REMOVE_TAB", id }), [dispatch]);
    const setActiveTab = useCallback((activeTab) => dispatch({ type: "SET_ACTIVE_TAB", activeTab }), [dispatch]);

    return (
        <TabsContext.Provider value={{
            tabs: state.tabs,
            addTab,
            moveTab,
            removeTab,
            activeTab: state.activeTab,
            setActiveTab
        }}>
            {children}
        </TabsContext.Provider>
    );
};

const useTabsContext = () => {
    const context = useContext(TabsContext);
    if (!context) {
        throw new Error("useTabsContext must be used within a TabsContextProvider");
    }
    return context;
};

export { TabsContextProvider, useTabsContext };