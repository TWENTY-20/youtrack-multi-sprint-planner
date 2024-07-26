import Island, { Header } from "@jetbrains/ring-ui-built/components/island/island";
import SavedQueriesSelect from "./SavedSearchSelect";
import { useCallback, useEffect, useState } from "react";
import { host } from "./index";
import Loader from "@jetbrains/ring-ui-built/components/loader/loader";
import ClickableLink from "@jetbrains/ring-ui-built/components/link/clickableLink";
import Icon from "@jetbrains/ring-ui-built/components/icon";
import NewWindow from "@jetbrains/icons/new-window";
import IssueSortableList from "./IssueSortableList";
import { ExtendedAgile, Issue, SavedQuery } from "./types";
import { AlertType } from "@jetbrains/ring-ui-built/components/alert/alert";
import { arrayMove } from "@dnd-kit/sortable";

//Todo: Infinite scrolling
export default function BacklogCard({ currentAgile }: { currentAgile: ExtendedAgile }) {
    const [currentQuery, setCurrentQuery] = useState<SavedQuery>(currentAgile.backlog);
    const [issues, setIssues] = useState<Issue[]>([]);
    const [isLoading, setLoading] = useState(true);

    useEffect(() => {
        if (currentQuery == null) return;
        host.fetchYouTrack(`savedQueries/${currentQuery.id}?fields=issues(id,idReadable,summary,project(id,name))`)
            .then((res: { issues: Issue[] }) => {
                setIssues(res.issues);
                setLoading(false);
            }).catch((e) => {
            console.log(e);
        });
    }, [currentQuery]);

    const updateUserDefaultSavedQuery = useCallback((savedQuery: SavedQuery) => {
        host.fetchYouTrack(`agiles/${currentAgile.id}`, {
            method: "POST",
            body: {
                backlog: { id: savedQuery.id }
            },
        }).catch((e) => {
            console.log(e);
        });
    }, [currentAgile]);

    function onSavedQuerySelect(savedQuery: SavedQuery) {
        updateUserDefaultSavedQuery(savedQuery);
        setCurrentQuery(savedQuery);
        setLoading(true);
    }

    async function updateSortOrder(leadingId: string | null, movedId: string): Promise<void> {
        await host.fetchYouTrack(`agiles/${currentAgile.id}/backlog/sortOrder`, {
            method: "POST",
            body: {
                leading: !leadingId ? null : {
                    id: leadingId
                },
                moved: {
                    id: movedId
                }
            }
        }).catch(() => {
            host.alert("Order was not saved, because you have no permissions", AlertType.WARNING);
            throw new Error("Could not reorder issues!");
        });
    }

    function onIssueRemove(_: Issue, oldIndex: number) {
        if (currentAgile.sprintsSettings.cardOnSeveralSprints) throw "Issue can be assigned to multiple sprints!";
        issues.splice(oldIndex, 1);
        setIssues(issues);
    }

    async function onIssueAdd(issue: Issue, newIndex: number) {
        const issueIndex = issues.findIndex(i => i.id === issue.id);
        // Check if issue is already in the list
        if (issueIndex >= 0) {
            //  Check if it was dragged to the same position
            if (issueIndex == newIndex || issueIndex == newIndex + 1) return;

            await onIssueReorder(issue, issueIndex, newIndex);
            return;
        }

        // YouTrack wants to wait for the issue to be deleted from a sprint before this endpoint should be called.
        // Currently, I can't think of a solution to resolve this that would not be dirty.
        // await host.fetchYouTrack(`agiles/${currentAgile.id}/backlog/issues/${issue.id}?fields=id,idReadable,summary,project(id,name)`)
        //     .then(async (issue: Issue) => {
        const leadingId = newIndex <= 0 ? null : issues[newIndex == issues.length - 1 ? newIndex - 1 : newIndex].id;

        await updateSortOrder(leadingId, issue.id);

        issues.splice(newIndex, 0, issue);
        setIssues(issues);
        // })
        // .catch((error: APIError) => {
        //     if (error.status != 404) throw new Error("Something went wrong");
        //
        //     host.alert("This issue does not match the saved search that is used for the backlog. To keep this card in the backlog, update the issue to match the saved search.", AlertType.WARNING);
        //     throw new Error("Issue does not belong to this backlog");
        // });
    }

    async function onIssueReorder(issue: Issue, oldIndex: number, newIndex: number) {
        const leadingId = newIndex <= 0 ? null : issues[newIndex].id;
        await updateSortOrder(leadingId, issue.id);
        const newOrder = arrayMove(issues, oldIndex, newIndex);
        setIssues(newOrder);
    }

    return (
        <Island className="w-full h-full">
            <Header border>
                <div className="font-normal">
                    <h2 className="text-2xl mb-3">Backlog</h2>
                    <span className="mr-1">Saved search:</span>
                    <SavedQueriesSelect
                        defaultSavedQuery={currentQuery}
                        onSelect={onSavedQuerySelect}
                        className="mr-3.5"
                    />
                    <ClickableLink target="_blank" href={"/issues?q=" + encodeURIComponent(currentQuery.query)}>
                        <Icon glyph={NewWindow}
                              className="text-[var(--ring-icon-color)] hover:text-[var(--ring-link-hover-color)]"/>
                    </ClickableLink>
                </div>

            </Header>
            <div className="h-full bg-[var(--ring-sidebar-background-color)] p-2 overflow-y-auto">
                {
                    isLoading &&
                    <div className="flex mt-8 justify-center h-full text-lg font-bold">
                        <Loader message="Loading Backlog..."/>
                    </div>
                }
                {
                    !isLoading && issues.length == 0 &&
                    <div className="flex flex-col space-y-4 mt-12 items-center">
                        <span className="text-base font-bold">The backlog is empty</span>
                        <span className="text-center">
                                    If there are cards on the board, you can focus your efforts there
                                    <br/>
                                    or fill the backlog with issues that match{" "}
                            <SavedQueriesSelect
                                defaultSavedQuery={currentQuery}
                                onSelect={onSavedQuerySelect}
                                defaultText="other search criteria"
                            />
                                </span>
                    </div>
                }
                {
                    !isLoading &&
                    <IssueSortableList
                        id="backlog"
                        originalIssues={issues}
                        onIssueRemove={onIssueRemove}
                        onIssueAdd={onIssueAdd}
                        onIssueReorder={onIssueReorder}
                    />
                }
            </div>
        </Island>
    );
}
