import { parse, format } from 'date-fns';

// safe date
export function dateParse(value?: string, dateFormat = 'yyyy-MM-dd') {
    return value ? parse(value, dateFormat, new Date()) : null;
}

// safe date
export function dateFormat(value?: Date, dateFormat = 'yyyy-MM-dd') {
    return value ? format(value, dateFormat) : null;
}
