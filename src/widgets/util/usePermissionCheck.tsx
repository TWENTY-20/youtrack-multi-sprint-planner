import {useEffect, useState} from "react";
import {checkPermissions} from "../util/util.ts";

export const READ_PROJECT = "jetbrains.jetpass.project-read"

export default function usePermissionCheck(permissions: string[]) {
    const [isLoading, setIsLoading] = useState(true)
    const [hasPermission, setHasPermission] = useState(false)

    useEffect(() => {
        setIsLoading(true)
        void checkPermissions(permissions).then(has => {
            setHasPermission(has)
            setIsLoading(false)
        })
    }, []);

    return {isLoading, hasPermission}
}
