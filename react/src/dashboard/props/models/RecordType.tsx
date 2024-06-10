import RecordTypeOption from './RecordTypeOption';
import RecordTypeOperator from './RecordTypeOperator';

export default interface RecordType {
    id: number;
    key: string;
    type: 'number' | 'string' | 'select' | 'bool' | 'date' | 'iban' | 'email';
    system: boolean;
    criteria: boolean;
    name: string;
    options: Array<RecordTypeOption>;
    operators?: Array<RecordTypeOperator>;
}
