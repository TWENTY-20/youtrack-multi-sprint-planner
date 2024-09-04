import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { DragEndEvent, DragOverEvent, DragStartEvent, useDndMonitor } from "@dnd-kit/core";
import { useEffect, useMemo, useState } from "react";
import { Issue } from "./types";
import DraggableIssueItem from "./DraggableIssueItem";
import { useDraggedIssue } from "./DraggedIssueProvider";
import EmptyDropzone from "./EmptyDropzone";

const prefixDivisionSign = "_";

function prefixIssue(issue: Issue, prefix: string) {
    return { ...issue, id: prefix + issue.id };
}

function prefixIssues(issues: Issue[], prefix: string) {
    return issues.map(issue => prefixIssue(issue, prefix));
}

function removePrefix(id: string) {
    if (!id.includes(prefixDivisionSign)) throw new Error("Given issue is not prefixed!");
    return id.split(prefixDivisionSign)[1];
}

function removeIssuePrefix(issue: Issue) {
    return { ...issue, id: removePrefix(issue.id) };
}

// if performance becomes a problem consider switching to virtualizing the list
export default function IssueSortableList(
    {
        originalIssues, id, cardOnSeveralSprints, onIssueRemove, onIssueAdd, onIssueReorder
    }: {
        id: string,
        originalIssues: Issue[],
        cardOnSeveralSprints?: boolean,
        onIssueRemove?: (issue: Issue, oldIndex: number) => void | Promise<void>
        onIssueAdd?: (issue: Issue, newIndex: number) => void | Promise<void>,
        onIssueReorder?: (issue: Issue, oldIndex: number, newIndex: number) => void | Promise<void>
    }) {

    const prefix = useMemo(() => id + prefixDivisionSign, [id]);

    const [issues, setIssues] = useState<Issue[]>(prefixIssues(originalIssues, prefix));

    useEffect(() => {
        setIssues(prefixIssues(originalIssues, prefix));
    }, [originalIssues, prefix]);

    const [clonedIssues, setClonedIssues] = useState<Issue[] | null>(null);

    const { draggedIssue, setDraggedIssue } = useDraggedIssue();

    useDndMonitor({
        onDragStart({ active }: DragStartEvent) {
            const activeId = active.id;
            if (typeof activeId !== "string") return;

            const activeIndex = issues.findIndex(issue => issue.id === activeId);
            if (activeIndex == -1) return;

            setDraggedIssue(active.data.current as Issue);

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
        onDragEnd({ active }: DragEndEvent) {
            if (draggedIssue)
                draggedIssue.loading = true;
            (async () => {
                // over.id and active.id are the same because list moving happens in onDragOver
                // activeId still has the prefix of its original list
                const activeId = active.id;
                if (activeId == null || typeof activeId != "string") return;

                const activeIndex = issues.findIndex(issue => issue.id === active.id);

                // Check if a duplicate of the dragged issue is in another sprint and remove it if issues can only be on one sprint
                if (cardOnSeveralSprints != undefined && !cardOnSeveralSprints && activeIndex == -1) {
                    const oldIndex = issues.findIndex(issue => issue.id === prefix + removePrefix(activeId));
                    if (oldIndex > -1) {
                        const oldIssue = removeIssuePrefix(issues[oldIndex]);
                        try {
                            await onIssueRemove?.(oldIssue, oldIndex);
                        } catch (_) { /* empty */
                        }
                        issues.splice(oldIndex, 1);
                        setIssues(issues);
                        if (clonedIssues) setClonedIssues(null);
                        return;
                    }
                }

                if (!clonedIssues) return;

                // Issue originated from the current container but got moved somewhere else
                if (activeId.startsWith(prefix) && activeIndex == -1) {
                    const oldIndex = clonedIssues.findIndex(issue => issue.id === activeId);
                    const oldIssue = removeIssuePrefix(clonedIssues[oldIndex]);
                    try {
                        await onIssueRemove?.(oldIssue, oldIndex);
                    } catch (_) {
                        setIssues(clonedIssues);
                    }
                    setClonedIssues(null);
                    return;
                }

                if (activeIndex == -1) {
                    setClonedIssues(null);
                    return;
                }

                const newIssues = issues.slice();
                let movedIssue = newIssues.splice(activeIndex, 1)[0];

                let movedIssueIsFromThisList = movedIssue.id.startsWith(prefix);
                movedIssue = removeIssuePrefix(movedIssue);

                if (!movedIssueIsFromThisList) {
                    const duplicateIndex = newIssues.findIndex(issue => issue.id === prefix + movedIssue.id);
                    if (duplicateIndex > -1) {
                        newIssues.splice(duplicateIndex, 1);
                        movedIssueIsFromThisList = true;
                    }
                }

                movedIssue.loading = true;

                const newIndex = activeIndex < 0 ? newIssues.length + activeIndex : activeIndex;
                newIssues.splice(newIndex, 0, prefixIssue(movedIssue, prefix));

                try {
                    if (movedIssueIsFromThisList) {
                        const oldIndex = clonedIssues.findIndex(issue => issue.id === prefix + movedIssue.id);
                        if (oldIndex != newIndex)
                            await onIssueReorder?.(movedIssue, oldIndex, newIndex);
                    } else {
                        await onIssueAdd?.(movedIssue, newIndex);
                    }

                    const movedIssueId = prefixIssue(movedIssue, prefix).id;
                    newIssues.forEach((issue) => {
                        if (issue.id === movedIssueId)
                            issue.loading = false;
                    });

                    setIssues(newIssues);
                } catch (_) {
                    setIssues(clonedIssues);
                }

                setDraggedIssue(null);
                setClonedIssues(null);
            })().catch(() => {
            });
        },
        onDragCancel() {
            if (clonedIssues) {
                setIssues(clonedIssues);
                setClonedIssues(null);
            }

            if (draggedIssue) setDraggedIssue(null);
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
