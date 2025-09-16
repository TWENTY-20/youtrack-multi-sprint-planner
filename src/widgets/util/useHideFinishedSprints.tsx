import {useEffect, useState} from "react";
import {getHideFinished, saveHideFinished} from "./globalStorageAccess.ts";

export default function useHideFinishedSprints(defaultValue: boolean) {
    const [hide, setHide] = useState<boolean>(defaultValue)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        getHideFinished().then(value => {
            if (value !== defaultValue && value !== null) setHide(value)
            setIsLoading(false)
        })
    }, []);

    const setHideFinishedSprints = (hideFinished: boolean) =>{
        setHide(hideFinished)
        saveHideFinished(hideFinished).catch((ex) => {
            console.error("Failed to save hide finished state", ex);
        });
    }

    return {hideFinishedSprints: hide, setHideFinishedSprints, hideFinishedSprintsLoading: isLoading}
}
