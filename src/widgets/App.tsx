import {useCallback, useEffect, useState} from "react";
import {host} from "./youTrackApp.ts";
import LoaderScreen from "@jetbrains/ring-ui-built/components/loader-screen/loader-screen";
import AgileSelection from "./AgileSelection";
import BacklogCard from "./BacklogCard";
import {closestCenter, DndContext, DragOverlay, useSensor, useSensors} from "@dnd-kit/core";
import {Agile, ExtendedAgile, Issue, Sprint} from "./types";
import IssueItem from "./IssueItem";
import {useDraggedIssue} from "./DraggedIssueProvider";
import SprintList from "./SprintList.tsx";
import {useTranslation} from "react-i18next";
import {PointerSensor} from "./sensor/PointerSensor.ts";
import {KeyboardSensor} from "./sensor/KeyboardSensor.ts";
import SprintSearch from "./SprintSearch.tsx";
import CustomFieldsPopUp from "./CustomFieldsPopUp.tsx";
import Button from "@jetbrains/ring-ui-built/components/button/button";
import Checkbox from "@jetbrains/ring-ui-built/components/checkbox/checkbox";
import CreateSprintPopUp from "./CreateSprintPopUp.tsx";

export default function App() {
    const {t} = useTranslation();
    const [currentAgile, setCurrentAgile] = useState<ExtendedAgile | null>(null);
    const [sprintFilter, setSprintFilter] = useState("");
    const {draggedIssue} = useDraggedIssue();
    const [isLoading, setLoading] = useState(true);
    const [selectedCustomFields, setSelectedCustomFields] = useState<string[]>([])
    const [hideFinished, setHideFinished] = useState(true)
    const [sprints, setSprints] = useState<Sprint[]>([]);


    useEffect(() => {
        host.fetchYouTrack(`agileUserProfile?fields=defaultAgile(id,name,projects(id),sprintsSettings(cardOnSeveralSprints,disableSprints),backlog(id,name,query))`)
            .then((agileUserProfile: { defaultAgile: ExtendedAgile }) => {
                if (!agileUserProfile.defaultAgile.sprintsSettings.disableSprints) {
                    setCurrentAgile(agileUserProfile.defaultAgile);
                } else {
                    host.fetchYouTrack(`agiles?fields=id,name,sprintsSettings(disableSprints,cardOnSeveralSprints),projects(id)`).then((newAgiles: ExtendedAgile[]) => {
                        newAgiles = newAgiles.filter(a => !a.sprintsSettings.disableSprints)
                        const agile = newAgiles.pop()
                        if (agile !== undefined) {
                            setCurrentAgile(agile)
                        } else {
                            setCurrentAgile(null)
                        }
                    }).catch(() => {
                    });
                }

            }).catch(() => {
        })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    const setIssues = useCallback((newIssues: Issue[], sprint: Sprint) => {
        setSprints((sprints) => {
            const index = sprints.findIndex(s => s.id === sprint.id);
            sprints[index] = {
                ...sprint,
                issues: newIssues
            } as Sprint;
            return sprints.slice(0);
        });
    }, []);

    const updateUserDefaultAgile = useCallback((agile: Agile) => {
        // Endpoint seems to be somehow messed up?? todo: observe future behaviour
        host.fetchYouTrack(`agileUserProfile?fields=defaultAgile(id,name,projects(id),sprintsSettings(cardOnSeveralSprints),backlog(id,name,query))`, {
            method: "POST",
            body: {
                defaultAgile: {id: agile.id}
            },
        }).then(async (result: { defaultAgile: ExtendedAgile }) => {
            if (result.defaultAgile.id != agile.id)
                return await host.fetchYouTrack(`agileUserProfile?fields=defaultAgile(id,name,projects(id),sprintsSettings(cardOnSeveralSprints),backlog(id,name,query))`, {
                    method: "POST",
                    body: {
                        defaultAgile: {id: agile.id}
                    },
                }) as typeof result;
            return result;
        }).then(({defaultAgile}: { defaultAgile: ExtendedAgile }) => {
            setCurrentAgile(defaultAgile);
            setSprintFilter("");
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


    return (
        <div className="flex flex-col space-y-4 h-full" style={{height: '100rem'}}>
            <DndContext
                collisionDetection={closestCenter}
                sensors={sensors}
            >
                {currentAgile &&
                    <div className="flex justify-between">
                        <AgileSelection defaultAgile={currentAgile} onSelect={updateUserDefaultAgile}/>
                        <div className={"flex flex-row space-x-4"}>
                            <Checkbox containerClassName={"forceCenter"} checked={hideFinished} onChange={() => setHideFinished(!hideFinished)} label={t('hideFinishedSprints')}></Checkbox>
                            <CreateSprintPopUp setSprints={setSprints} sprints={sprints} agile={currentAgile}/>
                            <SprintSearch key={sprintFilter} defaultSearch={sprintFilter} onSearch={setSprintFilter}/>
                            <CustomFieldsPopUp agile={currentAgile} selectedCustomFields={selectedCustomFields} setSelectedCustomFields={setSelectedCustomFields}></CustomFieldsPopUp>
                        </div>
                    </div>
                }
                {currentAgile ?
                    <div className="flex flex-col lg:flex-row space-y-8 lg:space-y-0 lg:overflow-y-hidden lg:h-full overflow-x-hidden">
                        <div className="w-full lg:w-1/2 lg:pr-4">
                            <BacklogCard currentAgile={currentAgile} key={currentAgile.backlog?.id} selectedCustomFields={selectedCustomFields}/>
                        </div>
                        <div className="w-full lg:w-1/2 lg:pl-4">
                            <SprintList sprints={sprints} setSprints={setSprints} setIssues={setIssues} agile={currentAgile} search={sprintFilter} selectedCustomFields={selectedCustomFields} hideFinishedSprints={hideFinished}/>
                        </div>
                    </div>
                    :
                    <div className={"flex flex-col justify-center items-center w-full h-full"} style={{fontSize: '14pt'}}>
                        <p className={"text-2xl font-semibold pb-4"}>{t('noBoardsAvailable')}</p>
                        <p className={"yt-text pb-6"}>{t('noBoardsAvailable2')}</p>
                        <Button primary href={"/agiles/create/scrum"}>{t('createNewScrumBoard')}</Button>
                    </div>
                }
                <DragOverlay>
                    {
                        draggedIssue &&
                        <IssueItem issue={draggedIssue} selectedCustomFields={selectedCustomFields}/>
                    }
                </DragOverlay>
            </DndContext>
        </div>
    );
}

