import { Issue } from "../../types.ts";
import { createContext, ReactNode, useContext, useState } from "react";

// Used to save the currently dragged issue because dnd-kit looses the data sometimes somehow

type DraggedIssueContextType = {
    draggedIssue: Issue | null,
    setDraggedIssue: (issue: Issue | null) => void,
}

const DraggedIssueContext = createContext<DraggedIssueContextType | undefined>(undefined);

export function useDraggedIssue(): DraggedIssueContextType {
    const context = useContext(DraggedIssueContext);
    if (!context) {
        throw new Error("useDraggedIssue must be used within a DraggedIssueProvider");
    }
    return context;
}

export function DraggedIssueProvider({ children }: { children: ReactNode }) {
    const [draggedIssue, setDraggedIssue] = useState<Issue | null>(null);

    return (
        <DraggedIssueContext.Provider value={{ draggedIssue, setDraggedIssue }}>
            {children}
        </DraggedIssueContext.Provider>
    );
}
