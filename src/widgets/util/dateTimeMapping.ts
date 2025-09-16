
export function formattedDateTime(date?: number) {
    if (date === undefined) return
    const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: "numeric",
        minute: "numeric"
    };
    return new Date(date).toLocaleDateString(undefined, options);
}

export function formattedDate(date?: number) {
    if (date === undefined) return
    const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric'
    };
    return new Date(date).toLocaleDateString(undefined, options);
}
