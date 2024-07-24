import Select, { Type } from "@jetbrains/ring-ui-built/components/select/select";
import { useCallback, useState } from "react";
import ClickableLink from "@jetbrains/ring-ui-built/components/link/clickableLink";
import { host } from "./index";
import { SavedQuery } from "./types";

export default function SavedSearchSelect({ defaultSavedQuery, defaultText, onSelect, className }: {
    defaultSavedQuery: SavedQuery,
    defaultText?: string,
    onSelect?: (item: SavedQuery) => void,
    className?: string,
}) {
    const [savedQueries, setSavedQueries] = useState<SavedQuery[] | null>(null);

    const loadSavedQueries = useCallback(() => {
        if (savedQueries != null) return;
        host.fetchYouTrack(`savedQueries?fields=id,name,query`).then((newSavedQueries: SavedQuery[]) => {
            setSavedQueries(newSavedQueries);
        }).catch((e) => {
            console.log(e);
        });
    }, [savedQueries]);

    const toSelectItem = (it: SavedQuery) => ({ key: it.id, label: it.name, model: it });

    return (
        <Select filter
                loading={savedQueries == null}
                onOpen={loadSavedQueries}
                data={savedQueries?.map(toSelectItem)}
                onSelect={(item) => {
                    if (!item) return;
                    onSelect?.(item.model);
                }}
                selected={toSelectItem(defaultSavedQuery)}
                type={Type.CUSTOM}
                customAnchor={(props) => {
                    return (
                        <span {...props.wrapperProps}
                              className={className + " text-[var(--ring-link-color)] hover:text-[var(--ring-link-hover-color)] cursor-pointer transition-[color var(--ring-fast-ease)]"}
                        >
                            <ClickableLink
                                {...props.buttonProps}
                                className="max-w-[200px] inline-block align-middle pb-[0.22rem] truncate"
                            >
                                {defaultText ?? defaultSavedQuery.name}
                            </ClickableLink>
                            {props.popup}
                        </span>
                    );
                }}
        />
    );
}
