import Island, { Header } from "@jetbrains/ring-ui-built/components/island/island";
import List from "@jetbrains/ring-ui-built/components/list/list";
import createIssueListItem from "./CreateIssueListItem";

export default function SprintCard({ sprint }: { sprint: any }) {
    return (
        <Island>
            <Header border><span className="text-2xl font-normal">{sprint.name}</span></Header>
            <div className="min-h-10 bg-[var(--ring-sidebar-background-color)] px-2">
                <List data={sprint.issues.map(createIssueListItem)}></List>
            </div>
        </Island>
    );
}
