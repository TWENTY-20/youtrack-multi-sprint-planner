import SprintContainer from "./SprintContainer.tsx";
import { useCallback, useEffect, useMemo, useState } from "react";
import { host } from "./youTrackApp.ts";
import { APIError, ExtendedAgile, Issue, Sprint } from "./types.ts";
import { AlertType } from "@jetbrains/ring-ui-built/components/alert/alert";
import { arrayMove } from "@dnd-kit/sortable";

export default function SprintList({ agile, search, selectedCustomFields }: { agile: ExtendedAgile, search: string , selectedCustomFields: string[] }) {
    const [sprints, setSprints] = useState<Sprint[]>([]);

    const lowerCaseSearch = useMemo(() => search.toLowerCase(), [search]);

    const loadIssuesOfSprint = useCallback(async (sprint: Sprint) => {
        return await host.fetchYouTrack(`agiles/${agile.id}/sprints/${sprint.id}/issues?fields=id,idReadable,summary,customFields(name,value(name)),project(id,name),isDraft&$top=-1`)
            .then((issues: Issue[]) => {
                return issues.filter(issue => !issue.isDraft);
            });
    }, [agile.id]);

    const setIssues = useCallback((newIssues: Issue[], sprint: Sprint) => {
        setSprints((sprints) => {
            const index = sprints.findIndex(s => s.id === sprint.id);
            sprints[index] = {
                ...sprint,
                issues: newIssues
            } as Sprint;
            return sprints.slice(0);
        });
    }, []);

    useEffect(() => {
        setSprints([]);
        (async () => {
            const sprints = await host.fetchYouTrack(`agiles/${agile.id}/sprints?fields=id,name,archived,start,finish&$top=-1`)
                .then((sprints: Sprint[]) => {
                    const cleanedSprints = sprints.filter((sprint) => !sprint.archived);
                    cleanedSprints.reverse()
                    setSprints(cleanedSprints);
                    return cleanedSprints;
                });
            const previewSprints = sprints
                .filter((sprint) => sprint.name.toLowerCase().includes(lowerCaseSearch))
                .slice(0, 5);

            const promises = previewSprints.map(async (sprint) => {
                const issues = await loadIssuesOfSprint(sprint);
                return { ...sprint, issues: issues } as Sprint;
            });

            const results = await Promise.allSettled(promises);

            for (const result of results) {
                if (result.status === "rejected") continue;

                const sprintWithIssues = result.value;
                setIssues(sprintWithIssues.issues!, sprintWithIssues);
            }
        })().catch((e) => console.log(e));

        // If the agile switched all other dependencies are also recomputed but if any of them changes it must not trigger this useEffect
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [agile.id]);

    async function onIssueRemove(issue: Issue, oldIndex: number, sprint: Sprint) {
        await host.fetchYouTrack(`agiles/${agile.id}/sprints/${sprint.id}/issues/${issue.id}`, {
            method: "DELETE"
        }).catch((error: APIError) => {
            host.alert(error.data.error_description, AlertType.ERROR);
            throw new Error(error.data.error_description);
        });

        // Should never happen because this function only gets called for sprints which are expanded and have at least an empty list
        if (!sprint.issues) return;

        const issues = sprint.issues;
        issues.splice(oldIndex, 1);
        setIssues(issues, sprint);
    }

    async function onIssueAdd(issue: Issue, newIndex: number, sprint: Sprint) {
        // Should never happen
        if (!sprint.issues) return;

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

        issue.loading = false;

        const issues = sprint.issues;
        issues.splice(newIndex, 0, issue);
        setIssues(issues, sprint);
    }

    // There is no api endpoint to reorder one issue in all others, only for board cells does such an endpoint exist
    function onIssueReorder(_: Issue, oldIndex: number, newIndex: number, sprint: Sprint) {
        // Should never happen
        if (!sprint.issues) return;

        const issues = arrayMove(sprint.issues, oldIndex, newIndex);
        setIssues(issues, sprint);
    }

    return (
        <div className="flex flex-col space-y-8 h-full overflow-y-auto">
            {
                sprints.map((sprint, index ) =>
                    sprint.name.toLowerCase().includes(lowerCaseSearch) &&
                    <SprintContainer
                        key={sprint.id}
                        sprint={sprint}
                        cardOnSeveralSprints={agile.sprintsSettings.cardOnSeveralSprints}
                        defaultCollapsed={index > 2}
                        onIssueRemove={(issue, oldIndex) => onIssueRemove(issue, oldIndex, sprint)}
                        onIssueAdd={(issue, newIndex) => onIssueAdd(issue, newIndex, sprint)}
                        onIssueReorder={(issue, oldIndex, newIndex) => onIssueReorder(issue, oldIndex, newIndex, sprint)}
                        onExpand={async () => {
                            if (sprint.issues) return;

                            setIssues(await loadIssuesOfSprint(sprint), sprint);
                        }}
                        selectedCustomFields={selectedCustomFields}
                    />)
            }
        </div>
    );
}
