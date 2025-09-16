import {CustomField, CustomFieldValue, PeriodValue} from "../types.ts";
import {formattedDate, formattedDateTime} from "./dateTimeMapping.ts";

export function mapCustomFields(f: CustomField) {
    if (Array.isArray(f.value)) {
        if (f.value.length === 0) return "?"
        return f.value.map(f => {
            return f.name
        }).join(', ')
    } else {
        if (f.value === null) return "?"
        if (f.projectCustomField.field.fieldType.id === "date and time") return !isNaN(Number(f.value)) ? formattedDateTime(Number(f.value)) ?? '?' : '?'
        if (f.$type === "DateIssueCustomField") return !isNaN(Number(f.value)) ? formattedDate(Number(f.value)) ?? '?' : '?'
        if (f.$type === "SimpleIssueCustomField") return String(f.value)
        if (typeof f.value === 'object') return mapObjectValue(f.value)
        return '?'
    }
}

export function mapObjectValue(value: CustomFieldValue| PeriodValue ){
    if ('presentation' in value) return value.presentation
    if ('name' in value) return value.name
    return "?"
}
