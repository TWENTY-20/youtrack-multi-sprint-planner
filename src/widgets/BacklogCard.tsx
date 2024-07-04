import Island, { Header } from "@jetbrains/ring-ui-built/components/island/island";
import SavedQueriesComponent from "./SavedSearchComponent";
import List from "@jetbrains/ring-ui-built/components/list/list";
import { useEffect, useLayoutEffect, useState } from "react";
import { host } from "./index";
import Loader from "@jetbrains/ring-ui-built/components/loader/loader";

export default function BacklogCard() {
    const [currentQuery, setCurrentQuery] = useState<any>(null);
    const [savedQueries, setSavedQueries] = useState<any[]>([]);
    const [issues, setIssues] = useState<any[]>([]);

    const [isLoading, setLoading] = useState(true);

    useLayoutEffect(() => {
        host.fetchYouTrack(`savedQueries?fields=id,name,query`).then((res: any[]) => {
            setSavedQueries(res);
            if (res.length > 0)
                setCurrentQuery(res[0]);
            setLoading(false);
        });
    }, []);

    useEffect(() => {
        if (currentQuery == null) return;
        host.fetchYouTrack(`savedQueries/${currentQuery.id}?fields=issues(idReadable,summary,project(id))`)
            .then((res: any) => {
                setIssues(res.issues);
            });
    }, [currentQuery]);

    if (isLoading) return (
        <Island className="w-full h-full flex items-center justify-center">
            <Loader message="Loading..."/>
        </Island>
    );

    return (
        <Island className="w-full h-full">
            <Header border>
                <div className="flex flex-col font-normal">
                    <span className="text-2xl mb-3">Backlog</span>
                    <SavedQueriesComponent savedQueries={savedQueries}
                                           onSelect={(item) => setCurrentQuery(item)}/>
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
