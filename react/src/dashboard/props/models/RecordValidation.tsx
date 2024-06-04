import RecordTypeOption from './RecordTypeOption';
import RecordTypeOperator from './RecordTypeOperator';

export default interface RecordValidation {
    id: number;
    state?: string;
    identity_address?: string;
    organization_id?: number;
}
