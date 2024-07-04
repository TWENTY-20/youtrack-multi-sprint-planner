import { useCallback, useState } from "react";
import Select, { Type } from "@jetbrains/ring-ui-built/components/select/select";
import { ControlsHeight } from "@jetbrains/ring-ui-built/components/global/controls-height";
import Button from "@jetbrains/ring-ui-built/components/button/button";
import IconSVG from "@jetbrains/ring-ui-built/components/icon/icon__svg";
import ChevronDownIcon from "@jetbrains/icons/chevron-20px-down";
import { host } from "./index";

export default function AgileSelection({ defaultAgile, onSelect }: {
    defaultAgile: any,
    onSelect?: (item: any) => void
}) {
    const [currentAgile, setCurrentAgile] = useState<any>(defaultAgile);
    const [agiles, setAgiles] = useState<any[] | null>(null);

    const toSelectItem = (it: any) => it && { key: it.id, label: it.name, model: it };

    const loadAgiles = useCallback(() => {
        if (agiles != null) return;
        host.fetchYouTrack(`agiles?fields=id,name`).then((newAgiles: any[]) => {
            setAgiles(newAgiles);
        });
    }, [agiles]);

    return (
        <Select filter
                loading={agiles == null}
                onOpen={loadAgiles}
                data={agiles?.map(toSelectItem)}
                onSelect={(item) => {
                    setCurrentAgile(item.model);
                    onSelect?.(item.model);
                }}
                type={Type.CUSTOM}
                selected={toSelectItem(currentAgile)}
                customAnchor={(props) => {
                    return (
                        <div {...props.wrapperProps} className="sizeM_rui_e9c2">
                            <Button height={ControlsHeight.L} primary
                                    {...props.buttonProps}
                            >
                                <div className="flex items-center">
                                    <span className="mr-2">{currentAgile.name}</span>
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
