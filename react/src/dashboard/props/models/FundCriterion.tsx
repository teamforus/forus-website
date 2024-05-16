import RecordType from './RecordType';
import Organization from './Organization';

export default interface FundCriterion {
    id?: number;
    record_type_key?: string;
    operator: '<' | '<=' | '>' | '>=' | '!=' | '=' | '*';
    show_attachment: boolean;
    title?: string;
    description?: string;
    description_html?: string;
    record_type?: RecordType;
    min?: string;
    max?: string;
    optional: boolean;
    value?: string;
    header?: string;
    external_validators: Array<{
        accepted: boolean;
        organization_id: number;
        organization_validator_id: number;
    }>;
    validators_models?: Array<Organization>;
    validators_available?: Array<{
        id: number;
        validator_organization_id?: number;
        validator_organization: { name: string };
    }>;
    validators?: Array<Array<Organization>>;
    validators_list?: Array<Array<Organization>>;
    show_external_validators_form?: boolean;
    new_validator?: number;
    use_external_validators?: boolean;
    is_editing?: boolean;
    is_new?: boolean;
    has_record?: boolean;
    is_valid?: boolean;
}
