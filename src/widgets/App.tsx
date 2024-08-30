import { useCallback, useEffect, useState } from "react";
import { host } from "./youTrackApp.ts";
import LoaderScreen from "@jetbrains/ring-ui-built/components/loader-screen/loader-screen";
import AgileSelection from "./AgileSelection";
import BacklogCard from "./BacklogCard";
import { closestCenter, DndContext, DragOverlay, useSensor, useSensors } from "@dnd-kit/core";
import { Agile, ExtendedAgile } from "./types";
import IssueItem from "./IssueItem";
import { useDraggedIssue } from "./DraggedIssueProvider";
import { AlertType } from "@jetbrains/ring-ui-built/components/alert/alert";
import SprintList from "./SprintList.tsx";
import { useTranslation } from "react-i18next";
import { PointerSensor } from "./sensor/PointerSensor.ts";
import { KeyboardSensor } from "./sensor/KeyboardSensor.ts";


//Todo: Localization
export default function App() {
    const { t } = useTranslation();

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
        }).then(async (result: { defaultAgile: ExtendedAgile }) => {
            if (result.defaultAgile.id != agile.id)
                return await host.fetchYouTrack(`agileUserProfile?fields=defaultAgile(id,name,projects(id),sprintsSettings(cardOnSeveralSprints),backlog(id,name,query))`, {
                    method: "POST",
                    body: {
                        defaultAgile: { id: agile.id }
                    },
                }) as typeof result;
            return result;
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

    if (isLoading) return <LoaderScreen message={t("loading")}/>;

    if (!currentAgile) {
        host.alert(t("loadAgileError"), AlertType.ERROR);
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
                        <BacklogCard currentAgile={currentAgile} key={currentAgile.backlog?.id}/>
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
