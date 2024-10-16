import Island, {Header} from "@jetbrains/ring-ui-built/components/island/island";
import IssueSortableList from "./IssueSortableList";
import {Issue, Sprint} from "./types";
import {useEffect, useMemo, useRef, useState} from "react";
import {BASE_ANIMATION_DURATION} from "@jetbrains/ring-ui-built/components/collapse/consts";
import {host} from "./youTrackApp.ts";
import {useTranslation} from "react-i18next";
import {AlertType} from "@jetbrains/ring-ui-built/components/alert/alert";
import LoaderInline from "@jetbrains/ring-ui-built/components/loader-inline/loader-inline";
import IconSVG from "@jetbrains/ring-ui-built/components/icon/icon__svg";
import ChevronDownIcon from "@jetbrains/icons/chevron-20px-down";
import ChevronUpIcon from "@jetbrains/icons/chevron-20px-up";
import {getIssueSortingBySprintId} from "./globalStorageAccess.ts";

// Collapsing was taken from jetbrains ring ui
const DURATION_FACTOR = 0.5;
const DEFAULT_HEIGHT = 0;
const VISIBLE = 1;
const HIDDEN = 0;

export default function SprintContainer(
    {
        sprint,
        cardOnSeveralSprints,
        defaultCollapsed: defaultCollapsed,
        onIssueRemove,
        onIssueAdd,
        onIssueReorder,
        onExpand,
        selectedCustomFields
    }: {
        sprint: Sprint,
        cardOnSeveralSprints: boolean,
        defaultCollapsed?: boolean,
        onIssueRemove?: (issue: Issue, oldIndex: number) => void | Promise<void>
        onIssueAdd?: (issue: Issue, newIndex: number) => void | Promise<void>,
        onIssueReorder?: (issue: Issue, oldIndex: number, newIndex: number) => void | Promise<void>
        onExpand?: () => void | Promise<void>
        selectedCustomFields: string[]
    }) {

    const {t} = useTranslation();

    const [collapsed, toggle] = useState(defaultCollapsed ?? false);
    const [loading, setLoading] = useState<boolean>(false);
    const contentRef = useRef<HTMLDivElement | null>(null);
    const initialContentHeight = useRef<number>(DEFAULT_HEIGHT);
    const contentHeight = useRef<number>(DEFAULT_HEIGHT);
    const [dimensions, setDimensions] = useState({
        width: 0,
        height: 0
    });
    const [height, setHeight] = useState<string>(`${initialContentHeight.current}px`);
    const [issueSorting, setIssueSorting] = useState<string[]>([])
    // Should happen only once when the sprint receives its issues
    useEffect(() => {
        if (defaultCollapsed !== undefined)
            toggle(defaultCollapsed);
    }, [defaultCollapsed]);

    useEffect(() => {
        if (contentRef.current) {
            contentHeight.current = contentRef.current.getBoundingClientRect().height;
        }
    }, [dimensions.height]);

    useEffect(() => {
        const nextHeight = collapsed ? initialContentHeight.current : contentHeight.current;
        setHeight(`${nextHeight}px`);
    }, [collapsed, dimensions.height]);

    useEffect(() => {
        void getIssueSortingBySprintId(sprint.id).then(sorting => {
            if (sorting !== null) setIssueSorting(sorting);

        })

        if (!contentRef.current) return;
        const observer = new ResizeObserver(([entry]) => {
            if (entry && entry.borderBoxSize) {
                const {inlineSize, blockSize} = entry.borderBoxSize[0];

                setDimensions({width: inlineSize, height: blockSize});
            }
        });
        observer.observe(contentRef.current);
    }, []);

    const style = useMemo(() => {
        const calculatedDuration = BASE_ANIMATION_DURATION + contentHeight.current * DURATION_FACTOR;
        return {
            "--duration": `${calculatedDuration}ms`,
            transition: "height var(--duration) ease-in-out 0s, opacity var(--duration) ease-in-out 0s",
            height,
            opacity: collapsed ? HIDDEN : VISIBLE
        };
    }, [height, collapsed]);


    return (
        <Island className="relative">
            <Header
                border
                aria-controls={`collapse-sprint-${sprint.id}`}
                aria-expanded={!collapsed}
                onClick={() => {
                    void (async () => {
                        setLoading(true);
                        try {
                            await onExpand?.();
                        } catch (_) {
                            host.alert(t("loadIssuesError"), AlertType.ERROR);
                        }
                        setLoading(false);
                        toggle(!collapsed);
                    })();
                }}
            >
                <div className="flex flex-col">
                    <span>
                    <span className="-ml-4 mr-4">
                        {
                            loading ? <LoaderInline className="!align-middle"/>
                                : collapsed ? <IconSVG src={ChevronDownIcon}/>
                                    : <IconSVG src={ChevronUpIcon}/>
                        }
                    </span>
                    <span className="text-xl font-normal">{sprint.name}</span>
                        {sprint.start !== undefined && sprint.finish !== undefined &&
                            <span
                                className="font-normal ml-5">{formattedDate(sprint.start)}-{formattedDate(sprint.finish)} </span>
                        }
                    </span>
                    <div className="h-2"></div>
                </div>
            </Header>
            <div className="relative overflow-hidden will-change-[height,opacity]"
                 id={`collapse-sprint-${sprint.id}`} style={style}>
                <div ref={contentRef} className="min-h-10 bg-[var(--ring-sidebar-background-color)] p-2 ">
                    {
                        !collapsed &&
                        <IssueSortableList
                            id={sprint.id}
                            originalIssues={sprint.issues ?? []}
                            cardOnSeveralSprints={cardOnSeveralSprints}
                            onIssueRemove={onIssueRemove}
                            onIssueAdd={onIssueAdd}
                            onIssueReorder={onIssueReorder}
                            selectedCustomFields={selectedCustomFields}
                            sprint={sprint}
                            issueSorting={issueSorting}
                        />
                    }
                </div>
            </div>
        </Island>
    );
}

function formattedDate(date?: number) {
    if (date === undefined) return
    const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric'
    };
    return new Date(date).toLocaleDateString(undefined, options);
}
