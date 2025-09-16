import {useEffect, useState} from "react";
import {Issue} from "../types.ts";
import {host} from "../youTrackApp.ts";

export const CUSTOM_FIELDS_FIELDS = "name,value(name,presentation),projectCustomField(field(fieldType(id)))"

export default function useBacklogIssues(currentQueryId: string | undefined) {
    const [loading, setLoading] = useState(true)
    const [issues, setIssues] = useState<Issue[]>([])

    useEffect(() => {
        if (!currentQueryId) {
            setLoading(false)
            return
        }
        setLoading(true)
        void host.fetchYouTrack(`savedQueries/${currentQueryId}/issues?fields=id,idReadable,summary,customFields(${CUSTOM_FIELDS_FIELDS}),project(id,name)&$top=-1`)
            .then((issues: Issue[]) => {
                setIssues(issues)
            }).finally(() => setLoading(false));
    }, [currentQueryId]);

    return {
        loading,
        issues,
        setIssues
    }

}
