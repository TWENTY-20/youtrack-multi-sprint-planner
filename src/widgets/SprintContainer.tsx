import Island, { Header } from "@jetbrains/ring-ui-built/components/island/island";
import IssueSortableList from "./IssueSortableList";
import { Issue, Sprint } from "./types";
import { useEffect, useMemo, useRef, useState } from "react";
import { BASE_ANIMATION_DURATION } from "@jetbrains/ring-ui-built/components/collapse/consts";
import IconSVG from "@jetbrains/ring-ui-built/components/icon/icon__svg";
import ChevronDownIcon from "@jetbrains/icons/chevron-20px-down";
import ChevronUpIcon from "@jetbrains/icons/chevron-20px-up";

// Collapsing was taken from jetbrains ring ui
const DURATION_FACTOR = 0.5;
const DEFAULT_HEIGHT = 0;
const VISIBLE = 1;
const HIDDEN = 0;

export default function SprintContainer({ sprint, cardOnSeveralSprints, onIssueRemove, onIssueAdd, onIssueReorder }: {
    sprint: Sprint,
    cardOnSeveralSprints: boolean,
    onIssueRemove?: (issue: Issue, oldIndex: number) => void | Promise<void>
    onIssueAdd?: (issue: Issue, newIndex: number) => void | Promise<void>,
    onIssueReorder?: (issue: Issue, oldIndex: number, newIndex: number) => void | Promise<void>
}) {
    const [collapsed, toggle] = useState(false);
    const contentRef = useRef<HTMLDivElement | null>(null);
    const initialContentHeight = useRef<number>(DEFAULT_HEIGHT);
    const contentHeight = useRef<number>(DEFAULT_HEIGHT);
    const [dimensions, setDimensions] = useState({
        width: 0,
        height: 0
    });
    const [height, setHeight] = useState<string>(`${initialContentHeight.current}px`);

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
        if (!contentRef.current) return;
        const observer = new ResizeObserver(([entry]) => {
            if (entry && entry.borderBoxSize) {
                const { inlineSize, blockSize } = entry.borderBoxSize[0];

                setDimensions({ width: inlineSize, height: blockSize });
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
        <Island>
            <Header border
                    onClick={() => toggle(!collapsed)}
                    aria-controls={`collapse-sprint-${sprint.id}`}
                    aria-expanded={!collapsed}
            >
                <div className="flex flex-col">
                    <span>
                    <span className="-ml-4 mr-4">
                    {collapsed ? <IconSVG src={ChevronDownIcon}/> : <IconSVG src={ChevronUpIcon}/>}
                    </span>
                    <span className="text-xl font-normal">{sprint.name}</span>
                    </span>
                    <div className="h-2"></div>
                </div>
            </Header>
            <div className="relative overflow-hidden will-change-[height,opacity]"
                 id={`collapse-sprint-${sprint.id}`} style={style}>
                <div ref={contentRef} className="min-h-10 bg-[var(--ring-sidebar-background-color)] p-2 ">
                    <IssueSortableList
                        id={sprint.id}
                        originalIssues={sprint.issues}
                        cardOnSeveralSprints={cardOnSeveralSprints}
                        onIssueRemove={onIssueRemove}
                        onIssueAdd={onIssueAdd}
                        onIssueReorder={onIssueReorder}
                    />
                </div>
            </div>
        </Island>
    );
}
