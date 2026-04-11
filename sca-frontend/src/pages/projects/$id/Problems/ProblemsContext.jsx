import { createContext, useContext, useState } from "react";

const ProblemsStateContext = createContext();
const ProblemsUpdateContext = createContext();

const ProblemsContextProvider = ({ defaultProblems = null, children }) => {
    const [problems, setProblems] = useState(defaultProblems);

    return (
        <ProblemsStateContext.Provider value={problems}>
            <ProblemsUpdateContext.Provider value={setProblems}>
                {children}
            </ProblemsUpdateContext.Provider>
        </ProblemsStateContext.Provider>
    );
};

const useProblemsStateContext = () => {
    const context = useContext(ProblemsStateContext);
    if (context === undefined) {
        throw new Error("useProblemsStateContext must be used within a ProblemsContextProvider");
    }
    return context;
};

const useProblemsUpdateContext = () => {
    const context = useContext(ProblemsUpdateContext);
    if (context === undefined) {
        throw new Error("useProblemsUpdateContext must be used within a ProblemsContextProvider");
    }
    return context;
};

const useProblemsContext = () => [useProblemsStateContext(), useProblemsUpdateContext()];

export { ProblemsContextProvider, useProblemsContext, useProblemsStateContext, useProblemsUpdateContext };