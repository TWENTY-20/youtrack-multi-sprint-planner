import ClickableLink from "@jetbrains/ring-ui-built/components/link/clickableLink";
import Icon from "@jetbrains/ring-ui-built/components/icon";
import Settings from "@jetbrains/icons/settings";
import Popup from "@jetbrains/ring-ui-built/components/popup/popup";
import Add from "@jetbrains/icons/add";
import Close from "@jetbrains/icons/close";
import Search from "@jetbrains/icons/search";
import {useCallback, useEffect, useState} from "react";
import {useTranslation} from "react-i18next";
import {host} from "./youTrackApp.ts";
import {CustomFieldWrapper, ExtendedAgile} from "./types.ts";
import Button from "@jetbrains/ring-ui-built/components/button/button";

export default function CustomFieldsPopUp({agile, selectedCustomFields, setSelectedCustomFields}: {
    agile: ExtendedAgile
    selectedCustomFields: string[]
    setSelectedCustomFields: (fields: string[]) => void
}) {
    const {t} = useTranslation();

    const [unselectedCustomFields, setUnselectedCustomFields] = useState<string[]>([])
    const [unSearchedCustomFields, setUnSearchedCustomFields] = useState<string[]>([])

    const [popUpHidden, setPopUpHidden] = useState(true)
    const [innerPopUpHidden, setInnerPopUpHidden] = useState(true)
    const [searchText, setSearchText] = useState("")

    useEffect(() => {
        /*void host.fetchApp(`backend/test1`, {
            method: 'POST',
        }).then((i)=> {
            console.log(i)
        }).then(()=>{
            void host.fetchApp(`backend/test2`, {}).then((i) => {
                console.log(i)
        })
        })*/
        const projects: string[] = agile.projects.map(p => p.id)
        projects.forEach((p) => {
            let customFields: string[] = []
            void host.fetchYouTrack(`admin/projects/${p}/customFields?fields=field(name)`)
                .then((fields: CustomFieldWrapper[]) => {
                    const mapped = fields.map(f => f.field.name)
                    const unique = [...new Set([...customFields, ...mapped])]
                    customFields = unique
                    //setUnselectedCustomFields(unique)
                    //setUnSearchedCustomFields(unique)
                    setSelectedCustomFields(unique) // todo
                }).catch()
        })
    }, []);

    const onSearchTextChanged = (text: string) => {
        setSearchText(text)
        if (text === "") {
            setUnselectedCustomFields(unSearchedCustomFields)
        } else {
            setUnselectedCustomFields(unSearchedCustomFields.filter(f => {
                return f.toLowerCase().startsWith(text.toLowerCase())
            }))
        }
    };

    const onSelectItem = useCallback((item: string) => {
        setUnselectedCustomFields(removeItem(item, unselectedCustomFields))
        setUnSearchedCustomFields(removeItem(item, unSearchedCustomFields))
        const s = [...selectedCustomFields]
        s.push(item)
        setSelectedCustomFields(s)
    }, [selectedCustomFields, unselectedCustomFields])

    const onUnselectItem = useCallback((item: string) => {
        setSelectedCustomFields(removeItem(item, selectedCustomFields))
        const u = [...unselectedCustomFields]
        u.push(item)
        setUnselectedCustomFields(u)
        const us = [...unselectedCustomFields]
        us.push(item)
        setUnSearchedCustomFields(us)
    }, [selectedCustomFields, unselectedCustomFields])

    function removeItem(item: string, items: string[]) {
        const index = items.indexOf(item)
        const copy = [...items]
        delete copy[index]
        return copy.filter(i => {
            return i !== undefined
        })
    }

    return (
        <ClickableLink className="" onClick={() => setPopUpHidden(!popUpHidden)}>
            <Icon glyph={Settings}
                  className="text-[var(--ring-icon-color)] hover:text-[var(--ring-link-hover-color)]"
                  style={{paddingTop: "6px", paddingLeft: "15px"}}
                  height={20}
                  width={20}
            />
            <Popup
                hidden={popUpHidden}
                onCloseAttempt={() => setPopUpHidden(true)}
                dontCloseOnAnchorClick={true}
            >
                <div className={"yt-issues-settings__dropdown"}>
                    <div className={"yt-box"}>
                        <b>{t("visibleFields")}</b>
                    </div>
                    <div className={"yt-dropdown-content"}>
                        <div className={"flex flex-col pt-1 pb-2"} style={{overflow: "hidden"}}>
                            {selectedCustomFields.map((f, index) =>
                                <div className={"itemButton flex justify-between"} key={index}>
                                    {f}
                                    <ClickableLink className={"itemButtonIcon"} onClick={() => {
                                        onUnselectItem(f)
                                    }}>
                                        <Icon glyph={Close}
                                              style={{height: "14px", width: "14px"}}
                                        />
                                    </ClickableLink>
                                </div>
                            )}

                        </div>
                    </div>
                    <div className={"yt-box"}>
                        <ClickableLink
                            className={"yt-icon-action hover:text-[var(--ring-link-hover-color)]"}
                            onClick={() => setInnerPopUpHidden(!innerPopUpHidden)}>
                            <Icon glyph={Add}
                                  className="mr-2"
                                  style={{height: "14px", width: "14px"}}
                            />
                            {t("addField")}
                            <Popup
                                className={"inner-popup"}
                                hidden={innerPopUpHidden}
                                onCloseAttempt={() => setInnerPopUpHidden(true)}
                                dontCloseOnAnchorClick={true}
                                left={170}
                                top={10}
                            >
                                <div className={"filterWrapper"}>
                                    <Icon glyph={Search}
                                          className="mr-3"
                                          style={{
                                              height: "14px",
                                              width: "14px",
                                              color: "var(--ring-icon-color)"
                                          }}
                                    />
                                    <div className={"grow"}>
                                        <input value={searchText} onChange={i => onSearchTextChanged(i.target.value)} className={"filterInput"} placeholder={"Filter items"}/>
                                    </div>
                                </div>

                                <div className={"flex flex-col pt-1 pb-2"} style={{overflow: "hidden"}}>
                                    {unselectedCustomFields.map((f, index) =>
                                        <Button className={"itemButton"} key={index} onClick={() => {
                                            onSelectItem(f)
                                        }}>
                                            {f}
                                        </Button>
                                    )}

                                </div>
                            </Popup>
                        </ClickableLink>
                    </div>
                </div>
            </Popup>
        </ClickableLink>
    )
}