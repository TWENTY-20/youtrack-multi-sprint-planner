import { arrayMove, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { DragEndEvent, DragOverEvent, DragStartEvent, useDndMonitor } from "@dnd-kit/core";
import { useState } from "react";
import { Issue } from "./types";
import DraggableIssueItem from "./DraggableIssueItem";
import { useDraggedIssue } from "./DraggedIssueProvider";
import EmptyDropzone from "./EmptyDropzone";

// if performance becomes a problem consider switching to virtualizing the list
export default function IssueSortableList(
    {
        originalIssues, id, onMoveEnd
    }: {
        id: string,
        originalIssues: Issue[],
        onMoveEnd?: (newIssues: Issue[]) => void,
    }) {

    const [issues, setIssues] = useState<Issue[]>(originalIssues);
    const [clonedIssues, setClonedIssues] = useState<Issue[] | null>(null);

    const { draggedIssue } = useDraggedIssue();

    useDndMonitor({
        onDragStart({ active }: DragStartEvent) {
            const activeId = active.id;
            if (typeof activeId !== "string") return;

            const activeIndex = issues.findIndex(issue => issue.id === activeId);
            if (activeIndex == -1) return;

            setClonedIssues([...issues]);
        },
        onDragOver({ active, over }: DragOverEvent) {
            const overId = over?.id;
            const activeId = active.id;

            if (!draggedIssue) return;

            if (typeof overId !== "string" || typeof activeId !== "string") return;

            const overIndex = issues.findIndex(issue => issue.id === overId);
            const activeIndex = issues.findIndex(issue => issue.id === activeId);
            const isOverThisContainer = overIndex != -1 || overId === id;
            const draggedIssueFromThisContainer = activeIndex != -1;

            if (!isOverThisContainer && !draggedIssueFromThisContainer) return;

            if (!clonedIssues) setClonedIssues([...issues]);

            if (!isOverThisContainer && draggedIssueFromThisContainer) {
                issues.splice(activeIndex, 1);
                setIssues([...issues]);
                return;
            }

            const isBelowOverItem =
                over &&
                active.rect.current.translated &&
                active.rect.current.translated.top >
                over.rect.top + over.rect.height;

            const modifier = isBelowOverItem ? 1 : 0;

            const newIndex = overIndex >= 0 ? overIndex + modifier : issues.length + 1;

            if (draggedIssueFromThisContainer)
                issues.splice(activeIndex, 1);

            setIssues(
                [
                    ...issues.slice(0, newIndex),
                    draggedIssue,
                    ...issues.slice(newIndex, issues.length)
                ]);
        },
        onDragEnd({ active, over }: DragEndEvent) {
            const overId = over?.id;
            if (overId == null) return;

            if (clonedIssues)
                setClonedIssues(null);

            const overIndex = issues.findIndex(issue => issue.id === overId);
            const activeIndex = issues.findIndex(issue => issue.id === active.id);

            if (overIndex == -1 || activeIndex == -1) return;

            const newIssues = arrayMove(issues, activeIndex, overIndex);

            setIssues(newIssues);
            onMoveEnd?.(newIssues);
        },
        onDragCancel() {
            if (clonedIssues) {
                setIssues(clonedIssues);
                setClonedIssues(null);
            }
        }
    });

    return (
        <div>
            {
                issues.length > 0 ?
                    <SortableContext
                        items={issues}
                        id={id}
                        strategy={verticalListSortingStrategy}
                    >
                        {issues.map(issue => <DraggableIssueItem key={issue.id} issue={issue}/>)}
                    </SortableContext>
                    :
                    <EmptyDropzone id={id}/>
            }
        </div>
    );
}
