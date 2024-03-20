export default interface EventLog {
    id: number;
    event_locale?: string;
    loggable_locale?: string;
    identity_email?: string;
    created_at_locale?: string;
    note?: string;
    note_substr?: string;
}
