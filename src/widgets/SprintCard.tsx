import Island, { Header } from "@jetbrains/ring-ui-built/components/island/island";
import List from "@jetbrains/ring-ui-built/components/list/list";

export default function SprintCard({ sprint }: { sprint: any }) {
    console.log(`Sprint ${sprint.name}:`);
    console.log(sprint.issues);
    return (
        <Island>
            <Header border><span className="text-2xl font-normal">{sprint.name}</span></Header>
            <div className="min-h-10">
                <List data={sprint.issues.map((issue: any) => ({
                    ...issue,
                    key: issue.idReadable,
                    label: issue.summary
                }))}></List>
            </div>
        </Island>
    );
}
