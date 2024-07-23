import "./App.css";
import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { host } from "./index";
import LoaderScreen from "@jetbrains/ring-ui-built/components/loader-screen/loader-screen";
import AgileSelection from "./AgileSelection";
import BacklogCard from "./BacklogCard";
import SprintContainer from "./SprintContainer";
import {
    closestCenter,
    DndContext,
    DragOverlay,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors
} from "@dnd-kit/core";
import { Agile, DefaultAgile, Issue, Sprint } from "./types";
import { IssueItem } from "./IssueItem";
import { useDraggedIssue } from "./DraggedIssueProvider";
import { AlertType } from "@jetbrains/ring-ui-built/components/alert/alert";


//Todo: Localization
//Todo: Error catching
export default function App() {
    const [currentAgile, setCurrentAgile] = useState<DefaultAgile | null>(null);
    const [sprints, setSprints] = useState<Sprint[]>([]);

    const { draggedIssue, setDraggedIssue } = useDraggedIssue();

    const [isLoading, setLoading] = useState(true);

    useLayoutEffect(() => {
        host.fetchYouTrack(`agileUserProfile?fields=defaultAgile(id,name,projects(id),sprintsSettings(cardOnSeveralSprints),backlog(id,name,query))`)
            .then((agileUserProfile: { defaultAgile: DefaultAgile }) => {
                setCurrentAgile(agileUserProfile.defaultAgile);
                setLoading(false);
            });
    }, []);

    const updateUserDefaultAgile = useCallback((agile: Agile) => {
        // Endpoint seems to be somehow messed up?? todo: observe future behaviour
        host.fetchYouTrack(`agileUserProfile?fields=defaultAgile(id,name,projects(id),sprintsSettings(cardOnSeveralSprints),backlog(id,name,query))`, {
            method: "POST",
            body: {
                defaultAgile: { id: agile.id }
            },
        }).then(({ defaultAgile }: { defaultAgile: DefaultAgile }) => {
            if (defaultAgile.id != agile.id)
                return host.fetchYouTrack(`agileUserProfile?fields=defaultAgile(id,name,projects(id),sprintsSettings(cardOnSeveralSprints),backlog(id,name,query))`, {
                    method: "POST",
                    body: {
                        defaultAgile: { id: agile.id }
                    },
                });
            return defaultAgile;
        }).then(({ defaultAgile }: { defaultAgile: DefaultAgile }) => {
            setCurrentAgile(defaultAgile);
        });
    }, []);

    useEffect(() => {
        if (currentAgile == null) return;
        setSprints([]);
        host.fetchYouTrack(`agiles/${currentAgile.id}/sprints?fields=id,name,issues(id,idReadable,summary,project(id,name),isDraft)`)
            .then((sprints: Sprint[]) => {
                // Filter out draft issues and add currentAgile as property
                const cleanedSprints = sprints.map(((sprint) => {
                    const cleanedIssues = sprint.issues.filter(issue => !issue.isDraft);
                    return { ...sprint, agile: currentAgile, issues: cleanedIssues };
                }));
                setSprints(cleanedSprints);
            });
    }, [currentAgile]);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5
            }
        }),
        useSensor(KeyboardSensor)
    );

    if (isLoading) return <LoaderScreen message="Loading..."/>;

    if (!currentAgile) {
        host.alert("Could not load projects! Please try again later...", AlertType.ERROR);
        return <></>;
    }

    return (
        <div className="flex flex-col space-y-4 h-full">
            <DndContext
                onDragStart={({ active }) => setDraggedIssue(active.data.current as Issue)}
                onDragEnd={() => setDraggedIssue(null)}
                onDragCancel={() => setDraggedIssue(null)}
                collisionDetection={closestCenter}
                sensors={sensors}
            >
                <AgileSelection defaultAgile={currentAgile} onSelect={(agile) => {
                    updateUserDefaultAgile(agile);
                }}/>
                <div className="flex flex-col md:flex-row space-y-8 md:space-y-0 md:space-x-8 grow">
                    <div className="w-full md:w-1/2">
                        <BacklogCard currentAgile={currentAgile}/>
                    </div>
                    <div className="w-full md:w-1/2 flex flex-col space-y-8 overflow-y-scroll">
                        {sprints.map((sprint, index) =>
                            <SprintContainer
                                sprint={sprint}
                                onMoveEnd={(issues) => {
                                    sprints[index] = {
                                        ...sprint,
                                        issues: issues
                                    } as Sprint;
                                    setSprints(sprints);
                                }}
                            />)}
                    </div>
                </div>
                <DragOverlay>
                    {
                        draggedIssue &&
                        <IssueItem issue={draggedIssue}/>
                    }
                </DragOverlay>
            </DndContext>
        </div>
    );
}
