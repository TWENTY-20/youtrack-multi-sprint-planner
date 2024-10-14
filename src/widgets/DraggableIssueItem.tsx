import {useSortable} from "@dnd-kit/sortable";
import {Issue} from "./types";
import IssueItem from "./IssueItem";

export default function DraggableIssueItem({issue, selectedCustomFields}: { issue: Issue, selectedCustomFields: string[] }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        isDragging,
    } = useSortable({id: issue.id, data: issue, disabled: issue.loading});

    return (
        <IssueItem
            ref={setNodeRef}
            issue={issue}
            attributes={attributes}
            listeners={listeners}
            isDragging={isDragging}
            selectedCustomFields={selectedCustomFields}
        />
    );
}
