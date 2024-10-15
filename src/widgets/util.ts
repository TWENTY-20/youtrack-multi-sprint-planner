import {host} from "./youTrackApp.ts";

interface CustomFieldsResponse {
    result: string
}


export async function saveSelectedCustomFields(agileId: string, customFields: string[]) {
    const values = [agileId, ...customFields];

    await getSelectedCustomFields().then(fields => {
        let fieldsString = " ";
        if (fields !== null) {
            const ids = fields.map((agile: string[]) => {
                if (agile.length > 0)
                    return agile[0]
                else return 'no-id'
            })
            const index = ids.indexOf(agileId)
            if (index > -1) {
                fields[index] = values
            } else {
                fields.push(values)
            }
            fieldsString = JSON.stringify(fields);
        } else {
            fieldsString = JSON.stringify([values]);
        }
        void host.fetchApp(`backend/saveCustomFields`, {
            method: 'POST',
            body: {customFields: fieldsString},
        })
    })
}

export async function getSelectedCustomFields(): Promise<string[][] | null> {
    return await host.fetchApp(`backend/getCustomFields`, {}).then((result: CustomFieldsResponse) => {
        if (result.result === null || result.result === " ") return null;
        let fieldsArray: string[][] | null = null;
        try {
            fieldsArray = JSON.parse(result.result);
        } catch (e) {
            console.error(e);
        }
        return fieldsArray;
    })
}

export async function getSelectedCustomFieldsById(agileId: string): Promise<string[] | null> {
    return await getSelectedCustomFields().then(entries => {
        if (entries !== null) {
            const fields = entries.find(e => {
                if (e.length > 0)
                    return e[0] === agileId
                else return false;
            })

            return fields?.slice(1) ?? null
        } else {
            return null;
        }
    })
}

