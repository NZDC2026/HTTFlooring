export function taskLocalTime(instant: Date, timeZone: string): string {
    const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone, year: "numeric", month: "2-digit", day: "2-digit",
        hour: "2-digit", minute: "2-digit", hourCycle: "h23",
    }).formatToParts(instant);
    const part = (name: string) => parts.find(item => item.type === name)?.value;
    return `${part("year")}-${part("month")}-${part("day")}T${part("hour")}:${part("minute")}`;
}

export function validTaskLocalTime(value: string) {
    return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value) &&
        Number.isFinite(Date.parse(value + ":00Z")) &&
        new Date(value + ":00Z").toISOString().slice(0, 16) === value;
}
