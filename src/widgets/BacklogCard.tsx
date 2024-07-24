import Island, { Header } from "@jetbrains/ring-ui-built/components/island/island";
import SavedQueriesSelect from "./SavedSearchSelect";
import { useCallback, useEffect, useState } from "react";
import { host } from "./index";
import Loader from "@jetbrains/ring-ui-built/components/loader/loader";
import ClickableLink from "@jetbrains/ring-ui-built/components/link/clickableLink";
import Icon from "@jetbrains/ring-ui-built/components/icon";
import NewWindow from "@jetbrains/icons/new-window";
import IssueSortableList from "./IssueSortableList";
import { DefaultAgile, Issue, SavedQuery } from "./types";

//Todo: Infinite scrolling
export default function BacklogCard({ currentAgile }: { currentAgile: DefaultAgile }) {
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
            <div className="h-full bg-[var(--ring-sidebar-background-color)] p-2">
                {
                    isLoading &&
                    <div className="flex mt-8 justify-center h-full text-lg font-bold">
                        <Loader message="Loading Backlog..."/>
                    </div>
                }
                {
                    !isLoading && issues.length == 0 &&
                    <div className="flex flex-col space-y-4 mt-12 items-center h-full">
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
                    !isLoading && issues.length > 0 &&
                    <IssueSortableList id="backlog" originalIssues={issues} onMoveEnd={setIssues}/>
                }
            </div>
        </Island>
    );
}
