import {Sprint} from "../types.ts";
import {host} from "../youTrackApp.ts";


function sortSprints(a: Sprint, b: Sprint) {
    if (a.start === undefined && b.start !== undefined) return 1
    if (a.start !== undefined && b.start === undefined) return -1
    if (a.start === undefined && b.start === undefined) return 0

    if (isCurrentSprint(a) && !isCurrentSprint(b)) return -1
    if (!isCurrentSprint(a) && isCurrentSprint(b)) return 1

    if (a.start! > b.start!) {
        return -1;
    }
    if (a.start! < b.start!) {
        return 1;
    }
    return 0;
}


async function fetchPaginated<T>(path: string): Promise<T[]> {
    const result: T[] = []
    let stop = false
    let skip = 0;
    while (!stop) {
        const pager = `&$skip=${skip}&$top=50`
        const items = await host.fetchYouTrack(path + pager).then((items: T[]) => {
            return items
        })
        if (items.length < 50) stop = true
        result.push(...items)
        skip += 50

    }
    return result
}

async function updateSortOrder(leadingId: string | null, movedId: string, agileId: string): Promise<void> {
    await host.fetchYouTrack(`agiles/${agileId}/backlog/sortOrder`, {
        method: "POST",
        body: {
            leading: !leadingId ? null : {
                id: leadingId
            },
            moved: {
                id: movedId
            }
        }
    });
}

function isCurrentSprint(sprint: Sprint): boolean {
    const now = Date.now()
    if (!sprint.start || !sprint.finish ) return false
    return now > sprint.start && now < sprint.finish
}

export {sortSprints, fetchPaginated, updateSortOrder, isCurrentSprint}
