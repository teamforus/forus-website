import File from './File';

export default interface FundRequestClarification {
    id?: number;
    answer?: string;
    question?: string;
    answered_at?: string;
    answered_at_locale?: string;
    state?: 'pending' | 'answered';
    files?: Array<File>;
    created_at?: string;
    created_at_locale?: string;
}
