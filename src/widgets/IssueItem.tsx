import ClickableLink from "@jetbrains/ring-ui-built/components/link/clickableLink";
import {Issue} from "./types";
import {forwardRef, useEffect, useState} from "react";
import {DraggableAttributes, DraggableSyntheticListeners} from "@dnd-kit/core";
import LoaderInline from "@jetbrains/ring-ui-built/components/loader-inline/loader-inline";

const IssueItem = forwardRef<HTMLDivElement, {
    issue: Issue,
    attributes?: DraggableAttributes,
    listeners?: DraggableSyntheticListeners,
    isDragging?: boolean,
    className?: string,
    selectedCustomFields: string[]
}>(({issue, attributes, listeners, isDragging, className, selectedCustomFields}, ref) => {
    (issue)

    const [customFields, setCustomFields] = useState<string[]>([])

    useEffect(() => {
        const fields = issue.customFields?.filter(f => {
            return selectedCustomFields.indexOf(f.name) > -1
        })
        if (fields === undefined) {
            return;
        }
        const cf: string[] = fields.map(f => {
            if (f.value === null) return "?"
            return f.value.name ?? "?"
        })
        setCustomFields(cf)
    }, [issue.customFields, selectedCustomFields]);


    return (
        isDragging ?
            <div className="w-full"
                 ref={ref}
                 style={{background: "rgba(var(--ring-border-hover-components), 0.5)"}}
                 {...attributes}
                 {...listeners}
            ></div>
            :
            <div
                className={
                    "flex flex-col justify-between py-1 px-2 bg-[var(--ring-content-background-color)] " +
                    "border border-[var(--ring-line-color)] " +
                    className
                }
                ref={ref}
                {...attributes}
                {...listeners}
            >
                <div className="flex flex-col">
                    <div className={"flex"}>

                        <ClickableLink
                            className="mr-4 text-[var(--ring-secondary-color)] hover:text-[var(--ring-link-hover-color)] hover:outline-none hover:underline"
                            target="_blank" href={`/issue/${issue.idReadable}`}
                        >
                            {issue.idReadable}
                        </ClickableLink>
                        {
                            issue.loading ?
                                <span className="ml-auto"><LoaderInline/></span>
                                :
                                <span className="truncate">{issue.summary}</span>
                        }
                        <p
                            className="ml-auto text-[var(--ring-secondary-color)] truncate"
                        >
                            {issue.customFields?.find(f => f.name === "Assignee")?.value?.name}
                        </p>
                    </div>

                    <div className={"flex, flex-row pt-1 pl-2"}>
                        {customFields.map((f, i) =>

                            <span style={{color: "var(--ring-secondary-color)"}} key={i}>{f}
                                {i < customFields.length - 1 &&
                                    <span className={"pl-2 pr-2"}>|</span>
                                }
                            </span>
                        )}

                    </div>
                </div>
            </div>
    );
});

IssueItem.displayName = "IssueItem";

export default IssueItem;
