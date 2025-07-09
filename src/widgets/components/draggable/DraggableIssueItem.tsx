import {useSortable} from "@dnd-kit/sortable";
import {Issue} from "../../types.ts";
import IssueItem from "../issue/IssueItem.tsx";

export default function DraggableIssueItem(
    {issue, selectedCustomFields, onIssueTop, onIssueBottom}:
    {
        issue: Issue,
        selectedCustomFields: string[]
        onIssueTop: (issue: Issue ) => void
        onIssueBottom: (issue: Issue) => void

    }) {
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
            onIssueTop={onIssueTop}
            onIssueBottom={onIssueBottom}
        />
    );
}
