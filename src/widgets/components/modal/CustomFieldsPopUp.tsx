import ClickableLink from "@jetbrains/ring-ui-built/components/link/clickableLink";
import Icon from "@jetbrains/ring-ui-built/components/icon";
import Settings from "@jetbrains/icons/settings";
import Popup from "@jetbrains/ring-ui-built/components/popup/popup";
import Add from "@jetbrains/icons/add";
import Close from "@jetbrains/icons/close";
import Search from "@jetbrains/icons/search";
import {useCallback, useEffect, useState} from "react";
import {useTranslation} from "react-i18next";
import {host} from "../../youTrackApp.ts";
import {CustomFieldWrapper, ExtendedAgile} from "../../types.ts";
import Button from "@jetbrains/ring-ui-built/components/button/button";
import {getSelectedCustomFieldsById, saveSelectedCustomFields} from "../../util/globalStorageAccess.ts";
import {Directions} from "@jetbrains/ring-ui-built/components/popup/popup.consts";
import Tooltip from "@jetbrains/ring-ui-built/components/tooltip/tooltip";
import Info from "@jetbrains/icons/info";

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
        void getSelectedCustomFieldsById(agile.id).then(storageFields => {
            const projects: string[] = agile.projects.map(p => p.id)
            let customFields: string[] = []
            projects.forEach((p) => {
                void host.fetchYouTrack(`admin/projects/${p}/customFields?fields=field(name)`)
                    .then((fields: CustomFieldWrapper[]) => {
                        const mapped = fields.map(f => f.field.name)
                        const unique = [...new Set([...customFields, ...mapped])]
                        customFields = unique
                        const unselected = mergeUnselectedFields(storageFields, unique)
                        setUnselectedCustomFields(unselected)
                        setUnSearchedCustomFields(unselected)
                        setSelectedCustomFields(removeOldFields(storageFields, unique))
                    }).catch()
            })
        })
    }, [agile]);

    const removeOldFields = (storageFields: string[] | null, apiFields: string[]): string[] => {
        if (storageFields === null) return []
        return storageFields.filter(f => {
            return apiFields.indexOf(f) > -1
        })
    }

    const mergeUnselectedFields = (storageFields: string[] | null, apiFields: string[]) => {
        const selectedFields = removeOldFields(storageFields, apiFields)
        return apiFields.filter(f => {
            return selectedFields.indexOf(f) === -1
        })
    }

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
        void saveSelectedCustomFields(agile.id, s)
    }, [selectedCustomFields, unselectedCustomFields])

    const onUnselectItem = useCallback((item: string) => {
        const selected = removeItem(item, selectedCustomFields)
        setSelectedCustomFields(selected)
        void saveSelectedCustomFields(agile.id, selected)
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
                  style={{paddingTop: "6px",}}
                  height={20}
                  width={20}
            />
            <Popup
                hidden={popUpHidden}
                onCloseAttempt={() => setPopUpHidden(true)}
                dontCloseOnAnchorClick={true}
            >
                <div className={"yt-issues-settings__dropdown"}>
                    <div className={"yt-box space-x-2"}>
                        <b>{t("visibleFields")}</b>
                        <Tooltip title={t('tooltip_customFields')}>
                            <Icon glyph={Info} className={'hoverIcon'}/>
                        </Tooltip>
                    </div>
                    <div className={"yt-dropdown-content"}>
                        <div className={"flex flex-col pt-1 pb-2"} style={{overflow: "hidden"}}>
                            {selectedCustomFields.length === 0 ? (
                                <div className={"flex justify-center align-middle p-2"}>
                                    <p style={{color: "var(--ring-secondary-color)"}}>{t('noFieldsSelected')}</p>
                                </div>
                            ) : (selectedCustomFields.map((f, index) =>
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
                                )
                            )
                            }


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
                                directions={[Directions.BOTTOM_LEFT]}
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
