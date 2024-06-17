import RecordType from './RecordType';

export default interface VoucherRecord {
    id: number;
    note?: string;
    value?: string;
    value_locale?: string;
    voucher_id?: number;
    record_type_id?: number;
    record_type_key?: string;
    record_type_name?: string;
    record_type?: RecordType;
    created_at?: string;
    created_at_locale?: string;
    updated_at?: string;
    updated_at_locale?: string;
}
