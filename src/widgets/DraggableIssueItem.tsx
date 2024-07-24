import { useSortable } from "@dnd-kit/sortable";
import { Issue } from "./types";
import IssueItem from "./IssueItem";

export default function DraggableIssueItem({ issue }: { issue: Issue }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        isDragging,
    } = useSortable({ id: issue.id, data: issue });

    return (
        <IssueItem
            ref={setNodeRef}
            issue={issue}
            attributes={attributes}
            listeners={listeners}
            isDragging={isDragging}
        />
    );
}
