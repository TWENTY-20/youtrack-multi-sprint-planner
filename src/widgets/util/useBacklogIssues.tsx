import {useEffect, useState} from "react";
import {Issue} from "../types.ts";
import {host} from "../youTrackApp.ts";

export default function useBacklogIssues(currentQueryId: string | undefined) {
    const [loading, setLoading] = useState(true)
    const [issues, setIssues] = useState<Issue[]>([])

    useEffect(() => {
        if (!currentQueryId) return
        console.log("load issues")
        setLoading(true)
        void host.fetchYouTrack(`savedQueries/${currentQueryId}/issues?fields=id,idReadable,summary,customFields(name,value(name)),project(id,name)&$top=-1`)
            .then((issues: Issue[]) => {
                setIssues(issues)
                setLoading(false)
            });
    }, [currentQueryId]);

    return {
        loading,
        issues,
        setIssues

    }

}
