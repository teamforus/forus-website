import RecordValidation from './RecordValidation';

export default interface Record {
    id?: number;
    key: string;
    value?: string;
    name: string;
    order?: string;
    deleted?: boolean;
    record_category_id?: number;
    state?: string;
    validations?: Array<RecordValidation>;
}
