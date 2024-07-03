import "./App.css";
import { useEffect, useLayoutEffect, useState } from "react";
import Island, { Header } from "@jetbrains/ring-ui-built/components/island/island";
import { host } from "./index";
import LoaderScreen from "@jetbrains/ring-ui-built/components/loader-screen/loader-screen";
import ProjectSelection from "./ProjectSelection";
import List from "@jetbrains/ring-ui-built/components/list/list";
import SavedQueriesComponent from "./SavedSearchComponent";


//Todo: Localization
export default function App() {
    const [currentAgile, setCurrentAgile] = useState<any>(null);
    const [currentProject, setCurrentProject] = useState<any>(null);
    const [agiles, setAgiles] = useState<any[]>([]);
    const [projects, setProjects] = useState<any[]>([]);
    const [currentQuery, setCurrentQuery] = useState<any>(null);
    const [savedQueries, setSavedQueries] = useState<any[]>([]);
    const [issues, setIssues] = useState<any[]>([]);

    const [isLoading, setLoading] = useState(true);

    useLayoutEffect(() => {
        Promise.all([
            host.fetchYouTrack(`agiles?fields=id,name,projects(id,name)`).then((agiles: any[]) => {
                setAgiles(agiles);

                const projects = agiles.flatMap((agile) => {
                    return agile.projects.map((project: any) => {
                        return {
                            ...project,
                            agile: agile
                        };
                    });
                });
                setProjects(projects);

                if (projects.length > 0) {
                    setCurrentAgile(projects[0].agile);
                    setCurrentProject(projects[0]);
                }
            }),
            host.fetchYouTrack(`savedQueries?fields=id,name,query`).then((res: any[]) => {
                setSavedQueries(res);
                if (res.length > 0)
                    setCurrentQuery(res[0]);
            })
        ]).then(() => setLoading(false));
    }, []);

    // useEffect(() => {
    // host.fetchYouTrack(`admin/projects/${currentProject.id}/issues?fields=id,summary`).then((res: any[]) => setIssues(res));
    // }, []);

    useEffect(() => {
        if (currentQuery == null) return;
        host.fetchYouTrack(`savedQueries/${currentQuery.id}?fields=issues(id,summary,project(id))`)
            .then((res: any) => {
                setIssues(res.issues);
            });
    }, [currentQuery]);

    if (isLoading) return <LoaderScreen message="Loading..."/>;

    if (!currentAgile || !currentProject) {
        host.alert("Could not load projects!");
        return <></>;
    }

    return (
        <div className="flex flex-col space-y-4 h-full">
            <ProjectSelection projects={projects} onSelect={setCurrentProject}/>
            <div className="flex grow">
                <Island className="w-1/3">
                    <Header border>
                        <div className="flex flex-col font-normal">
                            <span className="text-2xl mb-3">Backlog</span>
                            <SavedQueriesComponent savedQueries={savedQueries}
                                                   onSelect={(item) => setCurrentQuery(item)}/>
                        </div>
                    </Header>
                    <div className="h-full">
                        {issues.length == 0 ?
                            <div className="flex items-center justify-center h-full text-lg font-bold">
                                <span>The backlog is empty</span>
                            </div>
                            :
                            <List data={issues.map((issue) => ({
                                ...issue,
                                key: issue.key,
                                label: issue.summary
                            }))}></List>
                        }
                    </div>
                </Island>
            </div>
        </div>
    );
}
