import { useCallback, useLayoutEffect, useState } from "react";
import { host } from "./index";
import LoaderScreen from "@jetbrains/ring-ui-built/components/loader-screen/loader-screen";
import AgileSelection from "./AgileSelection";
import BacklogCard from "./BacklogCard";
import {
    closestCenter,
    DndContext,
    DragOverlay,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors
} from "@dnd-kit/core";
import { Agile, ExtendedAgile } from "./types";
import IssueItem from "./IssueItem";
import { useDraggedIssue } from "./DraggedIssueProvider";
import { AlertType } from "@jetbrains/ring-ui-built/components/alert/alert";
import SprintList from "./SprintList.tsx";


//Todo: Localization
//Todo: Error catching
export default function App() {
    const [currentAgile, setCurrentAgile] = useState<ExtendedAgile | null>(null);

    const { draggedIssue } = useDraggedIssue();

    const [isLoading, setLoading] = useState(true);

    useLayoutEffect(() => {
        host.fetchYouTrack(`agileUserProfile?fields=defaultAgile(id,name,projects(id),sprintsSettings(cardOnSeveralSprints),backlog(id,name,query))`)
            .then((agileUserProfile: { defaultAgile: ExtendedAgile }) => {
                setCurrentAgile(agileUserProfile.defaultAgile);
                setLoading(false);
            }).catch((e) => {
            console.log(e);
        });
    }, []);

    const updateUserDefaultAgile = useCallback((agile: Agile) => {
        // Endpoint seems to be somehow messed up?? todo: observe future behaviour
        host.fetchYouTrack(`agileUserProfile?fields=defaultAgile(id,name,projects(id),sprintsSettings(cardOnSeveralSprints),backlog(id,name,query))`, {
            method: "POST",
            body: {
                defaultAgile: { id: agile.id }
            },
        }).then(({ defaultAgile }: { defaultAgile: ExtendedAgile }) => {
            if (defaultAgile.id != agile.id)
                return host.fetchYouTrack(`agileUserProfile?fields=defaultAgile(id,name,projects(id),sprintsSettings(cardOnSeveralSprints),backlog(id,name,query))`, {
                    method: "POST",
                    body: {
                        defaultAgile: { id: agile.id }
                    },
                });
            return defaultAgile;
        }).then(({ defaultAgile }: { defaultAgile: ExtendedAgile }) => {
            setCurrentAgile(defaultAgile);
        }).catch((e) => {
            console.log(e);
        });
    }, []);

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
                collisionDetection={closestCenter}
                sensors={sensors}
            >
                <AgileSelection defaultAgile={currentAgile} onSelect={(agile) => {
                    updateUserDefaultAgile(agile);
                }}/>
                <div
                    className="flex flex-col md:flex-row space-y-8 md:space-y-0 md:space-x-8 md:overflow-y-hidden md:h-full">
                    <div className="w-full md:w-1/2">
                        <BacklogCard currentAgile={currentAgile}/>
                    </div>
                    <div className="w-full md:w-1/2">
                        <SprintList agile={currentAgile}/>
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
