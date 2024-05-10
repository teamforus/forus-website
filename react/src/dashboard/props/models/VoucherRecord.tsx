import RecordType from './RecordType';

export default interface VoucherRecord {
    id: number;
    voucher_id?: number;
    record_type_id?: number;
    value?: string;
    note?: string;
    deleted_at?: string;
    value_locale?: string;
    record_type_key?: string;
    record_type_name?: string;
    record_type?: RecordType;
    created_at_locale?: string;
}
