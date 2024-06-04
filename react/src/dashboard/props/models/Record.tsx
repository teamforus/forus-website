import RecordValidation from './RecordValidation';

export default interface Record {
    id: number;
    key: string;
    value: string;
    state?: string;
    name: string;
    order?: number;
    deleted?: boolean;
    record_category_id?: number;
    validations?: Array<RecordValidation>;
}
