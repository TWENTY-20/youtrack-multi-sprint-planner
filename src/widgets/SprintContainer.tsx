import Island, { Header } from "@jetbrains/ring-ui-built/components/island/island";
import IssueSortableList from "./IssueSortableList";
import { Issue, Sprint } from "./types";

export default function SprintContainer({ sprint, onMoveEnd }: {
    sprint: Sprint,
    onMoveEnd?: (issues: Issue[]) => void
}) {
    return (
        <Island>
            <Header border><span className="text-2xl font-normal">{sprint.name}</span></Header>
            <div className="min-h-10 bg-[var(--ring-sidebar-background-color)] p-2 overflow-y-auto">
                <IssueSortableList id={sprint.id} originalIssues={sprint.issues} onMoveEnd={onMoveEnd}/>
            </div>
        </Island>
    );
}
