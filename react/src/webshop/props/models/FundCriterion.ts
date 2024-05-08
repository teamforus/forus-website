import RecordType from '../../../dashboard/props/models/RecordType';

export default interface FundCriterion {
    description: string;
    description_html: string;
    external_validators: boolean;
    has_record: boolean;
    id: number;
    is_valid: boolean;
    max?: number;
    min?: number;
    operator: '<' | '<=' | '>' | '>=' | '!=' | '=' | '*';
    optional: boolean;
    record_type: RecordType;
    record_type_key: string;
    show_attachment: boolean;
    title: string;
    value: string;
}
