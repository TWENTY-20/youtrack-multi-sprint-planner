import Island, {Header} from "@jetbrains/ring-ui-built/components/island/island";
import SavedQueriesSelect from "./SavedSearchSelect.tsx";
import {useCallback, useEffect, useRef, useState} from "react";
import {host} from "../youTrackApp.ts";
import Loader from "@jetbrains/ring-ui-built/components/loader/loader";
import ClickableLink from "@jetbrains/ring-ui-built/components/link/clickableLink";
import Icon from "@jetbrains/ring-ui-built/components/icon";
import NewWindow from "@jetbrains/icons/new-window";

import IssueSortableList from "./issue/IssueSortableList.tsx";
import {ExtendedAgile, Issue, SavedQuery} from "../types.ts";
import {AlertType} from "@jetbrains/ring-ui-built/components/alert/alert";
import {arrayMove} from "@dnd-kit/sortable";
import {useTranslation} from "react-i18next";
import Input from "@jetbrains/ring-ui-built/components/input/input";
import {ControlsHeight} from "@jetbrains/ring-ui-built/components/global/controls-height";
import Search from "@jetbrains/icons/search";
import {updateSortOrder} from "../util/util.ts";

const TOP_ISSUE_AMOUNT = 50;

export default function BacklogCard({currentAgile, selectedCustomFields}: { currentAgile: ExtendedAgile, selectedCustomFields: string[] }) {
    const {t} = useTranslation();

    const [currentQuery, setCurrentQuery] = useState<SavedQuery | null>(currentAgile.backlog ?? null);
    const [issues, setIssues] = useState<Issue[]>([]);
    const [searchedIssues, setSearchedIssues] = useState<Issue[]>([])
    const [isLoading, setLoading] = useState(true);
    const [loadingMoreIssues, setLoadingMoreIssues] = useState(false);
    const [moreIssuesToLoad, setMoreIssuesToLoad] = useState(true);
    const [searchText, setSearchText] = useState<string>("")


    const scrollContainer = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setSearchedIssues(applySearch(issues, searchText))
    }, [issues, searchText]);


    const loadIssuesPaginated = useCallback(async (start: number) => {
        if (currentQuery == null) return;

        return await host.fetchYouTrack(`savedQueries/${currentQuery.id}/issues?fields=id,idReadable,summary,customFields(name,value(name)),project(id,name)&$skip=${start}&$top=${TOP_ISSUE_AMOUNT}`)
            .then((issues: Issue[]) => {
                if (issues.length < TOP_ISSUE_AMOUNT) setMoreIssuesToLoad(false);
                return issues;
            });
    }, [currentQuery]);

    useEffect(() => {
        setMoreIssuesToLoad(true);
        loadIssuesPaginated(0)
            .then((issues) => {
                if (!issues) return;
                setIssues(issues);
            }).catch(() => {
            host.alert(t("loadIssuesError"), AlertType.ERROR);
        }).finally(() => setLoading(false));
    }, [loadIssuesPaginated, currentQuery, t]);

    useEffect(() => {
        const scrollable = scrollContainer.current;
        if (!scrollable) return;
        const handleScroll = () => {
            // Users only have to scroll near the bottom
            const offset = 16;
            if (
                scrollable.scrollHeight == 0
                || scrollable.scrollHeight > scrollable.scrollTop + scrollable.clientHeight + offset
                || isLoading
                || loadingMoreIssues
                || !moreIssuesToLoad
            ) return;

            setLoadingMoreIssues(true);
            loadIssuesPaginated(issues.length).then((newIssues) => {
                if (!newIssues) return;
                setIssues([...issues, ...newIssues]);
                setLoadingMoreIssues(false);
            }).catch(() => {
            });
        };
        scrollable.addEventListener("scroll", handleScroll);

        return () => scrollable.removeEventListener("scroll", handleScroll);
    }, [isLoading, issues.length, loadIssuesPaginated, loadingMoreIssues, moreIssuesToLoad]);

    const updateUserDefaultSavedQuery = useCallback((savedQuery: SavedQuery) => {
        host.fetchYouTrack(`agiles/${currentAgile.id}`, {
            method: "POST",
            body: {
                backlog: {id: savedQuery.id}
            },
        }).catch((e) => {
            console.error(e);
        });
    }, [currentAgile]);

    function onSavedQuerySelect(savedQuery: SavedQuery) {
        updateUserDefaultSavedQuery(savedQuery);
        setCurrentQuery(savedQuery);
        setLoading(true);
    }



    function onIssueRemove(issue: Issue, oldIndex: number) {
        if (currentAgile.sprintsSettings.cardOnSeveralSprints) throw "Issue can be assigned to multiple sprints!";
        if (!currentAgile.projects.some(project => project.id === issue.project.id))
            throw "Issue cannot be used in this agile!";
        issues.splice(oldIndex, 1);
        setIssues(issues);
    }

    async function onIssueAdd(issue: Issue, newIndex: number) {
        const issueIndex = issues.findIndex(i => i.id === issue.id);
        // Check if issue is already in the list
        if (issueIndex >= 0) {
            //  Check if it was dragged to the same position
            if (issueIndex == newIndex || issueIndex == newIndex + 1) return;

            const leadingId = newIndex <= 0 ? null : issues[newIndex].id;
            await updateSortOrder(leadingId, issue.id, currentAgile.id).catch(() => {
            });

            const newOrder = arrayMove(issues, issueIndex, newIndex);
            setIssues(newOrder);

            return;
        }

        // YouTrack wants to wait for the issue to be deleted from a sprint before this endpoint should be called.
        // Currently, I can't think of a solution to resolve this that would not be dirty.
        // await host.fetchYouTrack(`agiles/${currentAgile.id}/backlog/issues/${issue.id}?fields=id,idReadable,summary,project(id,name)`)
        //     .then(async (issue: Issue) => {
        const leadingId = newIndex <= 0 ? null : issues[newIndex == issues.length ? newIndex - 1 : newIndex].id;

        await updateSortOrder(leadingId, issue.id, currentAgile.id);

        issue.loading = false;

        issues.splice(newIndex, 0, issue);
        setIssues(issues);
        // })
        // .catch((error: APIError) => {
        //     if (error.status != 404) throw new Error("Something went wrong");
        //
        //     host.alert("This issue does not match the saved search that is used for the backlog. To keep this card in the backlog, update the issue to match the saved search.", AlertType.WARNING);
        //     throw new Error("Issue does not belong to this backlog");
        // });
    }

    async function onIssueReorder(issue: Issue, oldIndex: number, newIndex: number) {
        const leadingId = newIndex <= 0 ? null : issues[newIndex].id;
        await updateSortOrder(leadingId, issue.id, currentAgile.id).catch(() => {
            host.alert(t("orderNotSavedError"), AlertType.WARNING);
            throw new Error("Could not reorder issues!");
        });
        const newOrder = arrayMove(issues, oldIndex, newIndex);
        setIssues(newOrder);
    }

    function applySearch(issues: Issue[], searchText: string) {
        const searchable = issues.map((i)=>{
            return {
                issue: i,
                text: i.idReadable + i.summary
            }
        })
        return searchable.filter((i) => i.text.toLowerCase().includes(searchText.toLowerCase())).map(i => i.issue);
    }

    const onSearchChanged = useCallback((text: string) => {
        setSearchText(text);
    }, [searchText])



    return (
        <Island className="w-full h-full">
            <Header border className={"disable-float"}>
                <div className="font-normal">
                    <div className={"flex flex-row justify-between"}>
                        <h2 className="text-2xl mb-3">{t("backlog")}</h2>
                        <Input className={"no-padding"} height={ControlsHeight.L} onChange={(i) => onSearchChanged(i.target.value)} value={searchText} icon={Search}
                               placeholder={t('searchInBacklog')}></Input>

                    </div>
                    {currentQuery &&
                        <>
                            <span className="mr-1">{t("savedSearch")}:</span>
                            <SavedQueriesSelect
                                defaultSavedQuery={currentQuery}
                                onSelect={onSavedQuerySelect}
                                className="mr-3.5"
                            />
                            <ClickableLink target="_blank" href={"/issues?q=" + encodeURIComponent(currentQuery.query)}>
                                <Icon glyph={NewWindow}
                                      className="text-[var(--ring-icon-color)] hover:text-[var(--ring-link-hover-color)]"/>
                            </ClickableLink>
                        </>
                    }
                </div>

            </Header>
            <div ref={scrollContainer} className="h-full bg-[var(--ring-sidebar-background-color)] p-2 overflow-y-auto">
                {
                    isLoading &&
                    <div className="flex mt-8 justify-center h-full text-lg font-bold">
                        <Loader message={t("loadingBacklog")}/>
                    </div>
                }
                {
                    !isLoading && issues.length == 0 &&
                    <div className="flex mt-12 justify-center">
                        <span className="text-base font-bold">{t("backlogEmpty")}</span>
                    </div>
                }
                {
                    !isLoading && currentQuery &&
                    <IssueSortableList
                        id="backlog"
                        originalIssues={searchedIssues}
                        unsearchedIssues={issues}
                        onIssueRemove={onIssueRemove}
                        onIssueAdd={onIssueAdd}
                        onIssueReorder={onIssueReorder}
                        selectedCustomFields={selectedCustomFields}
                    />
                }
            </div>
        </Island>
    );
}
