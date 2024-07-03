import Select, { Type } from "@jetbrains/ring-ui-built/components/select/select";
import { useState } from "react";
import ClickableLink from "@jetbrains/ring-ui-built/components/link/clickableLink";
import NewWindow from "@jetbrains/icons/new-window";
import Icon from "@jetbrains/ring-ui-built/components/icon";

export default function SavedSearchComponent({ savedQueries, onSelect }: {
    savedQueries: any[],
    onSelect?: (item: any) => void
}) {
    const [currentSearch, setCurrentSearch] = useState<any>(savedQueries[0]); // Todo: somehow get user preferred search

    const toSelectItem = (it: any) => it && { key: it.id, label: it.name, model: it };

    return (
        <div className="flex items-center">
            <span className="mr-1">Saved search:</span>
            <Select filter // hideArrow todo: find out why not working
                    data={savedQueries.map(toSelectItem)}
                    type={Type.CUSTOM}
                    onSelect={(item) => {
                        setCurrentSearch(item.model);
                        onSelect?.(item.model);
                    }}
                    selected={toSelectItem(currentSearch)}
                    className="mr-2"
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
