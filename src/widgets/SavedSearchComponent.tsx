import Select, { Type } from "@jetbrains/ring-ui-built/components/select/select";
import { useCallback, useState } from "react";
import ClickableLink from "@jetbrains/ring-ui-built/components/link/clickableLink";
import NewWindow from "@jetbrains/icons/new-window";
import Icon from "@jetbrains/ring-ui-built/components/icon";
import { host } from "./index";

export default function SavedSearchComponent({ defaultSavedQuery, onSelect }: {
    defaultSavedQuery: any,
    onSelect?: (item: any) => void
}) {
    const [currentSearch, setCurrentSearch] = useState<any>(defaultSavedQuery);
    const [savedQueries, setSavedQueries] = useState<any[] | null>(null);

    const loadSavedQueries = useCallback(() => {
        if (savedQueries != null) return;
        host.fetchYouTrack(`savedQueries?fields=id,name,query`).then((newSavedQueries: any[]) => {
            setSavedQueries(newSavedQueries);
        });
    }, [savedQueries]);

    const toSelectItem = (it: any) => it && { key: it.id, label: it.name, model: it };

    return (
        <div className="flex items-center">
            <span className="mr-1">Saved search:</span>
            <Select filter
                    loading={savedQueries == null}
                    onOpen={loadSavedQueries}
                    data={savedQueries?.map(toSelectItem)}
                    onSelect={(item) => {
                        setCurrentSearch(item.model);
                        onSelect?.(item.model);
                    }}
                    selected={toSelectItem(currentSearch)}
                    className="mr-2"
                    type={Type.CUSTOM}
                    customAnchor={(props) => {
                        return (
                            <div {...props.wrapperProps}
                                 className="flex items-center"
                            >
                                <ClickableLink
                                    {...props.buttonProps}
                                    className="mr-2 max-w-[200px] inline-block whitespace-nowrap overflow-hidden text-ellipsis text-[var(--ring-link-color)] hover:text-[var(--ring-link-hover-color)] cursor-pointer"
                                >
                                    {currentSearch.name}
                                </ClickableLink>
                                {props.popup}
                            </div>
                        );
                    }}
            />

            <ClickableLink target="_blank" href={"/issues?q=" + encodeURIComponent(currentSearch.query)}>
                <Icon glyph={NewWindow}
                      className="text-[var(--ring-icon-color)] hover:text-[var(--ring-link-hover-color)]"/>
            </ClickableLink>
        </div>
    );
}
