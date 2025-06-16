import {useState} from "react";
import Select, {Type} from "@jetbrains/ring-ui-built/components/select/select";
import {ControlsHeight} from "@jetbrains/ring-ui-built/components/global/controls-height";
import Button from "@jetbrains/ring-ui-built/components/button/button";
import IconSVG from "@jetbrains/ring-ui-built/components/icon/icon__svg";
import ChevronDownIcon from "@jetbrains/icons/chevron-20px-down";
import {host} from "./youTrackApp.ts";
import {Agile} from "./types";
import {useTranslation} from "react-i18next";

export default function AgileSelection({defaultAgile, onSelect}: {
    defaultAgile: Agile,
    onSelect: (item: Agile) => void
}) {
    const {t} = useTranslation();

    const [agiles, setAgiles] = useState<Agile[] | null>(null);

    const toSelectItem = (it: Agile) => ({key: it.id, label: it.name, model: it});

    function loadAgiles() {
        if (agiles != null) return;
        host.fetchYouTrack(`agiles?fields=id,name,sprintsSettings(disableSprints)&$top=1000`).then((newAgiles: Agile[]) => {
            newAgiles = newAgiles.filter(a=> {
                return !a.sprintsSettings.disableSprints
            })
            setAgiles(newAgiles);
        }).catch(() => {
        });
    }

    return (
        <Select filter={{placeholder: t("filterItems")}}
                loading={agiles == null}
                loadingMessage={t("loading")}
                notFoundMessage={t("noOptionsFound")}
                onOpen={loadAgiles}
                data={agiles?.map(toSelectItem)}
                onSelect={(item) => {
                    if (!item) return;
                    if (item.model.id === defaultAgile.id) {
                        return;
                    }
                    onSelect?.(item.model);
                }}
                height={ControlsHeight.L}
                type={Type.CUSTOM}
                selected={toSelectItem(defaultAgile)}
                customAnchor={(props) => {
                    return (
                        <div {...props.wrapperProps} className="">
                            <Button height={ControlsHeight.L} primary
                                    {...props.buttonProps}
                            >
                                <div className="flex items-center">
                                    <span className="mr-2">{defaultAgile.name}</span>
                                    <IconSVG src={ChevronDownIcon}/>
                                </div>
                            </Button>
                            {props.popup}
                        </div>
                    );
                }}
        />
    );
}
