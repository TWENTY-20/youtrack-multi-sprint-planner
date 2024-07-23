import ClickableLink from "@jetbrains/ring-ui-built/components/link/clickableLink";
import { Issue } from "./types";
import { forwardRef } from "react";
import { DraggableAttributes, DraggableSyntheticListeners } from "@dnd-kit/core";

export const IssueItem = forwardRef<HTMLDivElement, {
    issue: Issue,
    attributes?: DraggableAttributes,
    listeners?: DraggableSyntheticListeners,
    isDragging?: boolean,
    className?: string,
}>(({ issue, attributes, listeners, isDragging, className }, ref) => {

    return (
        isDragging ?
            <div className="h-16 w-full"
                 ref={ref}
                 style={{ background: "rgba(var(--ring-border-hover-components), 0.5)" }}
                 {...attributes}
                 {...listeners}
            ></div>
            :
            <div
                className={
                    "flex flex-col justify-between h-16 py-1 px-2 bg-[var(--ring-content-background-color)] " +
                    "border border-[var(--ring-line-color)] " +
                    className
                }
                ref={ref}
                {...attributes}
                {...listeners}
            >
                <div className="flex">
                    <ClickableLink
                        className="text-[var(--ring-secondary-color)] hover:text-[var(--ring-link-hover-color)] hover:outline-none hover:underline"
                        target="_blank" href={`/issue/${issue.idReadable}`}
                    >
                        {issue.idReadable}
                    </ClickableLink>
                </div>
                <div className="flex justify-between">
                    <span className="truncate">{issue.summary}</span>
                    <ClickableLink
                        className="text-[var(--ring-secondary-color)] hover:text-[var(--ring-link-hover-color)] hover:outline-none hover:underline truncate"
                        target="_blank" href={`/projects/${issue.project.id}`}
                    >
                        {issue.project.name}
                    </ClickableLink>
                </div>
            </div>
    );
});
