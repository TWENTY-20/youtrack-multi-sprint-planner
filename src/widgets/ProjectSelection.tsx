import { useState } from "react";
import Select, { Type } from "@jetbrains/ring-ui-built/components/select/select";
import { ControlsHeight } from "@jetbrains/ring-ui-built/components/global/controls-height";
import Button from "@jetbrains/ring-ui-built/components/button/button";
import Icon from "@jetbrains/ring-ui-built/components/icon";
import ChevronDownIcon from "@jetbrains/icons/chevron-20px-down";

export default function ProjectSelection({ projects, onSelect }: { projects: any[], onSelect?: (item: any) => void }) {
    const [currentProject, setCurrentProject] = useState<any>(projects[0]);

    const toSelectItem = (it: any) => it && { key: it.id, label: it.name, model: it };

    return (
        <Select data={projects.map(toSelectItem)} filter
                type={Type.CUSTOM}
                onSelect={(item) => {
                    setCurrentProject(item.model);
                    onSelect?.(item.model);
                }}
                selected={toSelectItem(currentProject)}
                customAnchor={(props) => {
                    return (
                        <div {...props.wrapperProps} className="sizeM_rui_e9c2">
                            <Button height={ControlsHeight.L} primary
                                    {...props.buttonProps}
                            >
                                <span className="mr-2">{currentProject.name}</span>
                                <Icon glyph={ChevronDownIcon}/>
                            </Button>
                            {props.popup}
                        </div>
                    );
                }}
        />
    );
}
