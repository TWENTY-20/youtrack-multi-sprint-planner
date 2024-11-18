import {useCallback, useEffect, useState} from "react";
import Button from "@jetbrains/ring-ui-built/components/button/button";
import Popup from "@jetbrains/ring-ui-built/components/popup/popup";
import {useTranslation} from "react-i18next";
import Input from "@jetbrains/ring-ui-built/components/input/input";
import DatePicker from "@jetbrains/ring-ui-built/components/date-picker/date-picker";
import Checkbox from "@jetbrains/ring-ui-built/components/checkbox/checkbox";
import {ControlsHeight} from "@jetbrains/ring-ui-built/components/global/controls-height";
import {DatePickerChange} from "@jetbrains/ring-ui-built/components/date-picker/consts";
import {host} from "./youTrackApp.ts";
import {APIError, ExtendedAgile, Sprint} from "./types.ts";
import {fetchPaginated, sortSprints} from "./util.ts";
import Select, {Type} from "@jetbrains/ring-ui-built/components/select/select";
import {AlertType} from "@jetbrains/ring-ui-built/components/alert/alert";


export default function CreateSprintPopUp({agile, sprints, setSprints}: { agile: ExtendedAgile, sprints: Sprint[], setSprints: (sprints: Sprint[]) => void }) {

    const {t} = useTranslation();
    const [popUpHidden, setPopUpHidden] = useState(true)
    const [sprintName, setSprintName] = useState<string | undefined>(undefined)
    const [goal, setGoal] = useState<string | undefined>(undefined)
    const [from, setFrom] = useState<Date | null | undefined>()
    const [to, setTo] = useState<Date | null | undefined>()
    const [addOldIssues, setAddOldIssues] = useState(false)
    const [sprintsUnresolved, setSprintsUnresolved] = useState<Sprint[]>([])
    const [selectedSprint, setSelectedSprint] = useState<Sprint>()

    useEffect(() => {
        void fetchPaginated<Sprint>(`agiles/${agile.id}/sprints?fields=id,name,issues(id,resolved)`).then((sprints: Sprint[]) => {
                sprints = sprints.map(s => {
                    s.issues = s.issues?.filter(i => i.resolved === null)
                    return s;
                })
                    .filter(s => s.issues !== undefined)
                    .filter(s => s.issues!.length > 0)
                setSprintsUnresolved(sprints)
                if (sprints.length > 0) setSelectedSprint(sprints.at(-1))
            }
        )
    }, [agile, sprints]);

    const sprintToSelectItem = (it: Sprint) => ({key: it.id, label: it.name, model: it});

    const saveDisabled = useCallback(() => {
        return sprintName === undefined || sprintName === ''
    }, [sprintName])

    const onSave = useCallback(() => {
        const sprint = addOldIssues && selectedSprint !== undefined ?
            {
                start: from?.valueOf(),
                finish: to?.valueOf(),
                goal: goal,
                name: sprintName,
                previousSprint: selectedSprint
            } : {
                start: from?.valueOf(),
                finish: to?.valueOf(),
                goal: goal,
                name: sprintName,
            }
        void host.fetchYouTrack(`agiles/${agile.id}/sprints?fields=id,name,archived,start,finish,issues(id,idReadable,summary,resolved,customFields(name,value(name)),project(id,name))`, {
            method: "POST",
            body: sprint
        }).then((sprint: Sprint) => {
            console.log(sprint)
            const newSprints = [...sprints, sprint].sort((a, b) => sortSprints(a, b))
            setSprints(newSprints)
            return sprint
        }).then((s) => {
            setPopUpHidden(true)
            setSelectedSprint(s)
            setSprintName(undefined)
            setGoal(undefined)
            setFrom(undefined)
            setTo(undefined)
            setAddOldIssues(false)
            window.parent.location.href = '/app/multi-sprint-planner/main-menu'
        }).catch((e: APIError) => {
            if (e.data.error === "invalid_properties") {
                host.alert(t('nameExits_error'), AlertType.ERROR)
            } else {
                host.alert(t('error'), AlertType.ERROR)
            }
        })
    }, [addOldIssues, selectedSprint, agile.id, from, to, goal, sprintName, sprints, setSprints])

    function onCancel() {
        setPopUpHidden(true)
        setSprintName(undefined)
        setGoal(undefined)
        setFrom(undefined)
        setTo(undefined)
        setAddOldIssues(false)
    }

    return (<Button height={ControlsHeight.L} onClick={() => setPopUpHidden(false)}>
        {t('newSprint')}
        <Popup
            hidden={popUpHidden}
            onCloseAttempt={() => setPopUpHidden(true)}
            dontCloseOnAnchorClick={true}
            className={'add-popup'}
            trapFocus={true}
        >
            <div className={"flex flex-col"} style={{padding: "32px"}}>
                <h1 className={"pb-2"} style={{fontSize: '24px', fontWeight: 600}}> {t('newSprint')}</h1>
                <div className={"grid grid-cols-4 pt-6 w-full"}>
                    <p className={" col-span-1 pb-4"}>{t('sprintName')}</p>
                    <Input value={sprintName} onChange={(e) => setSprintName(e.target.value)} className={"col-span-3 pb-4 forceWidthAuto"}></Input>
                    <p className={'pb-4'}>{t('goal')}</p>
                    <Input value={goal} onChange={(e) => setGoal(e.target.value)} inputClassName={"forceTextareaHeight"} className={"col-span-3 w-a pb-4 forceWidthAuto"} multiline></Input>
                    <p className={"pb-4"}>{t('schedule')}</p>
                    <DatePicker from={from} to={to} onChange={(e: DatePickerChange) => {
                        setFrom(e.from);
                        setTo(e.to)
                    }} className={"col-span-3  pb-4"} range={true} rangePlaceholder={t('notScheduled')}/>
                    {selectedSprint &&
                        <Checkbox id={"checkAddIssues"} checked={addOldIssues} onChange={() => setAddOldIssues(!addOldIssues)} containerClassName={"col-start-2 col-span-3 pb-6"}>
                            {t('addIssues1')} {selectedSprint.issues?.length} {t('addIssues2')}
                            <Select
                                popupClassName={"pop-width"}
                                filter
                                data={sprintsUnresolved.map(sprintToSelectItem)}
                                selected={sprintToSelectItem(selectedSprint)}
                                type={Type.INLINE}
                                onSelect={item => {
                                    if (!item) return
                                    setSelectedSprint(item.model)
                                }}>
                            </Select>
                        </Checkbox>
                    }
                    <Button primary onClick={onSave} disabled={saveDisabled()} className={'forceMargin'} height={ControlsHeight.S}>{t('createSprint')}</Button>
                    <Button onClick={onCancel} height={ControlsHeight.S}>{t('cancel')}</Button>
                </div>
            </div>
        </Popup>
    </Button>)
}
