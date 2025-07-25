import searchIcon from "@jetbrains/icons/search";
import closeIcon from "@jetbrains/icons/close";
import {useTranslation} from "react-i18next";
import {useState} from "react";
import Icon from "@jetbrains/ring-ui-built/components/icon";

export default function SprintSearch({defaultSearch, onSearch}: {
    defaultSearch: string,
    onSearch: (value: string) => void
}) {
    const {t} = useTranslation();
    const [value, setValue] = useState(defaultSearch);

    return (
        <div className="flex search-border remove-input-focus">
            <input
                className=" !pl-2 !pr-12 "
                placeholder={t("searchSprintPlaceholder")}
                value={value}
                onChange={(event) => setValue(event.currentTarget.value)}
                onKeyDown={(event) => event.key === "Enter" && onSearch(value)}
            />
            <button
                className="mr-2 text-[var(--ring-icon-color)] hover:text-[var(--ring-link-hover-color)]"
                style={{marginLeft: "-3.75rem"}}
                onClick={() => {
                    setValue("");
                    onSearch("");
                }}
                title={t("clearInput")}
            >
                <Icon glyph={closeIcon}/>
            </button>
            <button
                className="button_rui_6ad6 !px-2"
                type="submit"
                title={t("searchSprint")}
                onClick={() => onSearch(value)}
            >
                <Icon glyph={searchIcon}/>
            </button>
        </div>
    );
}
