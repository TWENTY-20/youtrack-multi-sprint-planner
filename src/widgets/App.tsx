import { useCallback, useEffect, useState } from "react";
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
export default function App() {
    const [currentAgile, setCurrentAgile] = useState<ExtendedAgile | null>(null);

    const { draggedIssue } = useDraggedIssue();

    const [isLoading, setLoading] = useState(true);

    useEffect(() => {
        host.fetchYouTrack(`agileUserProfile?fields=defaultAgile(id,name,projects(id),sprintsSettings(cardOnSeveralSprints),backlog(id,name,query))`)
            .then((agileUserProfile: { defaultAgile: ExtendedAgile }) => {
                setCurrentAgile(agileUserProfile.defaultAgile);
            }).catch(() => {
        }).finally(() => {
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
        }).catch(() => {
            setCurrentAgile(null);
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
                    className="flex flex-col lg:flex-row space-y-8 lg:space-y-0 lg:space-x-8 lg:overflow-y-hidden lg:h-full overflow-x-hidden">
                    <div className="w-full lg:w-1/2">
                        <BacklogCard currentAgile={currentAgile}/>
                    </div>
                    <div className="w-full lg:w-1/2">
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
