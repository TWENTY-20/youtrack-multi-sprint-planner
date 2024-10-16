import {host} from "./youTrackApp.ts";

interface GlobalStorageResponse {
    result: string
}

function manageStringArray(current: string[][] | null, valuesId: string, content: string[]): string {
    const values = [valuesId, ...content];
    let resultString = " "
    if (current !== null) {
        const ids = current.map((agile: string[]) => {
            if (agile.length > 0)
                return agile[0]
            else return 'no-id'
        })
        const index = ids.indexOf(valuesId)
        if (index > -1) {
            current[index] = values
        } else {
            current.push(values)
        }
        resultString = JSON.stringify(current);
    } else {
        resultString = JSON.stringify([values]);
    }
    return resultString
}

async function fetchGlobalStorage(url: string): Promise<string[][] | null> {
    return await host.fetchApp(url, {}).then((result: GlobalStorageResponse) => {
        if (result.result === null || result.result === " ") return null;
        let values: string[][] | null = null;
        try {
            values = JSON.parse(result.result);
        } catch (e) {
            console.error(e);
        }
        return values;
    })
}

function findEntry(entries: string[][] | null, id: string): string[] | null {
    if (entries !== null) {
        const fields = entries.find(e => {
            if (e.length > 0)
                return e[0] === id
            else return false;
        })
        return fields?.slice(1) ?? null
    } else {
        return null;
    }
}

// Selected CustomFields

export async function saveSelectedCustomFields(agileId: string, customFields: string[]) {
    await fetchGlobalStorage('backend/getCustomFields').then(fields => {
        const fieldsString = manageStringArray(fields, agileId, customFields)
        void host.fetchApp(`backend/saveCustomFields`, {
            method: 'POST',
            body: {value: fieldsString},
        })
    })
}

export async function getSelectedCustomFieldsById(agileId: string): Promise<string[] | null> {
    return await fetchGlobalStorage('backend/getCustomFields').then(entries => {
        return findEntry(entries, agileId)
    })
}

// Sorting of Issues in SprintContainer

export async function saveIssueSorting(sprintId: string, values: string[]) {
    await fetchGlobalStorage('backend/getIssueSorting').then(sortings => {
        const sortingString = manageStringArray(sortings, sprintId, values)
        void host.fetchApp(`backend/saveIssueSorting`, {
            method: 'POST',
            body: {value: sortingString},
        })
    })
}

export async function getIssueSortingBySprintId(sprintId: string) {
    return await fetchGlobalStorage('backend/getIssueSorting').then(entries => {
        return findEntry(entries, sprintId)
    })
}




