export default interface ReservationField {
    id?: number;
    type: 'text' | 'number';
    organization_id?: number;
    label: string;
    description: string;
    required: boolean;
    order?: number;
}
