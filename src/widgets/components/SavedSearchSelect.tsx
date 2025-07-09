import Select, { Type } from "@jetbrains/ring-ui-built/components/select/select";
import { useState } from "react";
import ClickableLink from "@jetbrains/ring-ui-built/components/link/clickableLink";
import { host } from "../youTrackApp.ts";
import { SavedQuery } from "../types.ts";
import { useTranslation } from "react-i18next";

export default function SavedSearchSelect({ defaultSavedQuery, defaultText, onSelect, className }: {
    defaultSavedQuery: SavedQuery,
    defaultText?: string,
    onSelect?: (item: SavedQuery) => void,
    className?: string,
}) {
    const { t } = useTranslation();

    const [savedQueries, setSavedQueries] = useState<SavedQuery[] | null>(null);

    function loadSavedQueries() {
        if (savedQueries != null) return;
        host.fetchYouTrack(`savedQueries?fields=id,name,query`).then((newSavedQueries: SavedQuery[]) => {
            setSavedQueries(newSavedQueries);
        }).catch(() => {
        });
    }

    const toSelectItem = (it: SavedQuery) => ({ key: it.id, label: it.name, model: it });

    return (
        <Select filter={{ placeholder: t("filterItems") }}
                loading={savedQueries == null}
                loadingMessage={t("loading")}
                notFoundMessage={t("noOptionsFound")}
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
