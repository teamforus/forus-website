export default interface RecordType {
    id: number;
    key: string;
    type: 'number' | 'string' | 'select' | 'bool' | 'date' | 'iban' | 'email';
    system: boolean;
    name: string;
    options: Array<{ value: string; name: string }>;
}
