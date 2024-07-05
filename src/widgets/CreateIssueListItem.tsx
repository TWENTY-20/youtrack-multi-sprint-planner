import ClickableLink from "@jetbrains/ring-ui-built/components/link/clickableLink";
import { Type } from "@jetbrains/ring-ui-built/components/list/consts";

export default function createIssueListItem(issue: any) {

    const content = (
        <div
            className="flex flex-col justify-between h-16">
            <div className="flex">
                <ClickableLink
                    className="text-[var(--ring-secondary-color)] hover:text-[var(--ring-link-hover-color)] hover:outline-none hover:underline"
                    target="_blank" href={`/issue/${issue.idReadable}`}
                >
                    {issue.idReadable}
                </ClickableLink>
            </div>
            <div className="flex justify-between">
                <span>{issue.summary}</span>
                <ClickableLink
                    className="text-[var(--ring-secondary-color)] hover:text-[var(--ring-link-hover-color)] hover:outline-none hover:underline"
                    target="_blank" href={`/projects/${issue.project.id}`}
                >
                    {issue.project.name}
                </ClickableLink>
            </div>
        </div>
    );

    return {
        key: issue.idReadable,
        template: content,
        rgItemType: Type.CUSTOM,
        disabled: true,
        className: "bg-[var(--ring-content-background-color)] border border-[var(--ring-line-color)] focus:shadow-[inset_0_0_0_2px_var(--ring-main-color)]"
    };
}
