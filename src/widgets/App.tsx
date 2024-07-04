import "./App.css";
import { useEffect, useLayoutEffect, useState } from "react";
import { host } from "./index";
import LoaderScreen from "@jetbrains/ring-ui-built/components/loader-screen/loader-screen";
import AgileSelection from "./AgileSelection";
import BacklogCard from "./BacklogCard";
import SprintCard from "./SprintCard";


//Todo: Localization
//Todo: Error catching
export default function App() {
    const [currentAgile, setCurrentAgile] = useState<any>(null);
    const [agiles, setAgiles] = useState<any[]>([]);
    const [sprints, setSprints] = useState<any[]>([]);

    const [isLoading, setLoading] = useState(true);

    useLayoutEffect(() => {
        Promise.all([
            host.fetchYouTrack(`agiles?fields=id,name,projects(id),sprintSettings(cardOnSeveralSprints)`).then((agiles: any[]) => {
                if (agiles.length > 0) {
                    setAgiles(agiles);
                    setCurrentAgile(agiles[0]);
                }
            }),
        ]).then(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (currentAgile == null) return;
        host.fetchYouTrack(`agiles/${currentAgile.id}/sprints?fields=id,name,issues(idReadable,summary,project(id),isDraft)`)
            .then((sprints: any[]) => {
                // Filter out draft issues
                const cleanedSprints = sprints.map(((sprint) => {
                    const cleanedIssues = sprint.issues.filter((issue: any) => !issue.isDraft);
                    return { ...sprint, issues: cleanedIssues };
                }));
                setSprints(cleanedSprints);
            });
    }, [currentAgile]);

    if (isLoading) return <LoaderScreen message="Loading..."/>;

    if (!currentAgile) {
        host.alert("Could not load projects!");
        return <></>;
    }

    return (
        <div className="flex flex-col space-y-4 h-full">
            <AgileSelection agiles={agiles} onSelect={(agile) => {
                setCurrentAgile(agile);
            }}/>
            <div className="flex grow">
                <div className="w-1/3">
                    <BacklogCard/>
                </div>
                <div className="w-2/3 pl-8 flex flex-col space-y-8">
                    {sprints.map((sprint) => <SprintCard sprint={sprint}/>)}
                </div>
            </div>
        </div>
    );
}
