import SprintContainer from "./SprintContainer.tsx";
import { useEffect, useState } from "react";
import { host } from "./index.tsx";
import { APIError, ExtendedAgile, Issue, Sprint } from "./types.ts";
import { AlertType } from "@jetbrains/ring-ui-built/components/alert/alert";
import { arrayMove } from "@dnd-kit/sortable";

//todo: Pagination?
export default function SprintList({ agile }: { agile: ExtendedAgile }) {
    const [sprints, setSprints] = useState<Sprint[]>([]);

    useEffect(() => {
        setSprints([]);
        host.fetchYouTrack(`agiles/${agile.id}/sprints?fields=id,name,issues(id,idReadable,summary,project(id,name),isDraft)`)
            .then((sprints: Sprint[]) => {
                // Filter out draft issues and add currentAgile as property
                const cleanedSprints = sprints.map(((sprint) => {
                    const cleanedIssues = sprint.issues.filter(issue => !issue.isDraft);
                    return { ...sprint, agile: agile, issues: cleanedIssues };
                }));
                setSprints(cleanedSprints);
            }).catch((e) => {
            console.log(e);
        });
    }, [agile]);

    function setIssues(newIssues: Issue[], sprint: Sprint) {
        const index = sprints.findIndex(s => s.id === sprint.id);
        sprints[index] = {
            ...sprint,
            issues: newIssues
        } as Sprint;
        setSprints(sprints);
    }

    async function onIssueRemove(issue: Issue, oldIndex: number, sprint: Sprint) {
        await host.fetchYouTrack(`agiles/${agile.id}/sprints/${sprint.id}/issues/${issue.id}`, {
            method: "DELETE"
        }).catch((error: APIError) => {
            host.alert(error.data.error_description, AlertType.ERROR);
            throw new Error(error.data.error_description);
        });

        const issues = sprint.issues;
        issues.splice(oldIndex, 1);
        setIssues(issues, sprint);
    }

    async function onIssueAdd(issue: Issue, newIndex: number, sprint: Sprint) {
        const issueIndex = sprint.issues.findIndex(i => i.id === issue.id);
        // Check if issue is already in the list
        if (issueIndex >= 0) {
            //  Check if it was dragged to the same position
            if (issueIndex == newIndex || issueIndex == newIndex + 1) return;

            onIssueReorder(issue, issueIndex, newIndex, sprint);
            return;
        }

        await host.fetchYouTrack(`agiles/${agile.id}/sprints/${sprint.id}/issues`, {
            method: "POST",
            body: {
                id: issue.id
            }
        }).catch((error: APIError) => {
            host.alert(error.data.error_description, AlertType.ERROR);
            throw new Error(error.data.error_description);
        });

        const issues = sprint.issues;
        issues.splice(newIndex, 0, issue);
        setIssues(issues, sprint);
    }

    // There is no api endpoint to reorder one issue in all others, only for board cells does such an endpoint exist
    function onIssueReorder(_: Issue, oldIndex: number, newIndex: number, sprint: Sprint) {
        const issues = arrayMove(sprint.issues, oldIndex, newIndex);
        setIssues(issues, sprint);
    }

    return (
        <div className="flex flex-col space-y-8 h-full overflow-y-auto">
            {
                sprints.map((sprint) =>
                    <SprintContainer
                        key={sprint.id}
                        sprint={sprint}
                        cardOnSeveralSprints={agile.sprintsSettings.cardOnSeveralSprints}
                        onIssueRemove={(issue, oldIndex) => onIssueRemove(issue, oldIndex, sprint)}
                        onIssueAdd={(issue, newIndex) => onIssueAdd(issue, newIndex, sprint)}
                        onIssueReorder={(issue, oldIndex, newIndex) => onIssueReorder(issue, oldIndex, newIndex, sprint)}
                    />)
            }
        </div>
    );
}
