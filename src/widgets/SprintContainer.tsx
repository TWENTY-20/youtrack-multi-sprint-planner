import Island, { Header } from "@jetbrains/ring-ui-built/components/island/island";
import IssueSortableList from "./IssueSortableList";
import { Issue, Sprint } from "./types";

export default function SprintContainer({ sprint, onIssueRemove, onIssueAdd, onIssueReorder }: {
    sprint: Sprint,
    onIssueRemove?: (issue: Issue, oldIndex: number) => void | Promise<void>
    onIssueAdd?: (issue: Issue, newIndex: number) => void | Promise<void>,
    onIssueReorder?: (issue: Issue, oldIndex: number, newIndex: number) => void | Promise<void>
}) {
    return (
        <Island>
            <Header border><span className="text-2xl font-normal">{sprint.name}</span></Header>
            <div className="min-h-10 bg-[var(--ring-sidebar-background-color)] p-2">
                <IssueSortableList
                    id={sprint.id}
                    originalIssues={sprint.issues}
                    onIssueRemove={onIssueRemove}
                    onIssueAdd={onIssueAdd}
                    onIssueReorder={onIssueReorder}
                />
            </div>
        </Island>
    );
}
