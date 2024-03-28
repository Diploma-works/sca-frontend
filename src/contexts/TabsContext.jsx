import { createContext, useCallback, useContext, useReducer } from "react";
import { arrayMove } from "@dnd-kit/sortable";

const TabsContext = createContext();

const tabsReducer = (state, action) => {
    switch (action.type) {
        case "ADD_TAB":
            const existingTab = state.tabs.find((tab) => tab.id === action.tab.id);
            if (existingTab) {
                return { ...state, activeValue: existingTab.id };
            }
            return { ...state, tabs: [...state.tabs, action.tab], activeValue: action.tab.id };
        case "MOVE_TAB":
            return { ...state, tabs: arrayMove(state.tabs, action.from, action.to) };
        case "REMOVE_TAB":
            if (action.id === state.activeValue) {
                const indexToDelete = state.tabs.findIndex((tab) => tab.id === state.activeValue);
                const tabs = [...state.tabs];
                tabs.splice(indexToDelete, 1);
                return { tabs, activeValue: indexToDelete === 0 ? tabs[0]?.id : state.tabs[indexToDelete - 1].id };
            }
            return { ...state, tabs: state.tabs.filter((tab) => tab.id !== action.id) };
        case "SET_VALUE":
            return { ...state, activeValue: action.activeValue };
        default:
            return state;
    }
};

const TabsContextProvider = ({ tabs, activeValue, children }) => {
    const [state, dispatch] = useReducer(tabsReducer, { tabs: tabs ?? [], activeValue: activeValue ?? null });

    const addTab = useCallback((tab) => dispatch({ type: "ADD_TAB", tab }), [dispatch]);
    const moveTab = useCallback((from, to) => dispatch({ type: "MOVE_TAB", from, to }), [dispatch]);
    const removeTab = useCallback((id) => dispatch({ type: "REMOVE_TAB", id }), [dispatch]);
    const setActiveValue = useCallback((activeValue) => dispatch({ type: "SET_VALUE", activeValue }), [dispatch]);

    return (
        <TabsContext.Provider value={{
            tabs: state.tabs,
            addTab,
            moveTab,
            removeTab,
            activeValue: state.activeValue,
            setActiveValue
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