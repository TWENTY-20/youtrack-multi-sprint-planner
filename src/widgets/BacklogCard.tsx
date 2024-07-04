import Island, { Header } from "@jetbrains/ring-ui-built/components/island/island";
import SavedQueriesComponent from "./SavedSearchComponent";
import List from "@jetbrains/ring-ui-built/components/list/list";
import { useCallback, useEffect, useState } from "react";
import { host } from "./index";

export default function BacklogCard({ currentAgile }: { currentAgile: any }) {
    const [currentQuery, setCurrentQuery] = useState<any>(currentAgile.backlog);
    const [issues, setIssues] = useState<any[]>([]);

    useEffect(() => {
        if (currentQuery == null) return;
        host.fetchYouTrack(`savedQueries/${currentQuery.id}?fields=issues(idReadable,summary,project(id))`)
            .then((res: any) => {
                setIssues(res.issues);
            });
    }, [currentQuery]);

    const updateUserDefaultSavedQuery = useCallback((savedQuery: any) => {
        host.fetchYouTrack(`agiles/${currentAgile.id}`, {
            method: "POST",
            body: {
                backlog: { id: savedQuery.id }
            },
        });
    }, [currentAgile]);

    return (
        <Island className="w-full h-full">
            <Header border>
                <div className="flex flex-col font-normal">
                    <span className="text-2xl mb-3">Backlog</span>
                    <SavedQueriesComponent
                        defaultSavedQuery={currentQuery}
                        onSelect={(savedQuery) => {
                            updateUserDefaultSavedQuery(savedQuery);
                            setCurrentQuery(savedQuery);
                        }}
                    />
                </div>
            </Header>
            <div className="h-full">
                {
                    issues.length == 0 ?
                        <div className="flex items-center justify-center h-full text-lg font-bold">
                            <span>The backlog is empty</span>
                        </div>
                        :
                        <List data={issues.map((issue) => ({
                            ...issue,
                            key: issue.idReadable,
                            label: issue.summary
                        }))}></List>
                }
            </div>
        </Island>
    );
}
