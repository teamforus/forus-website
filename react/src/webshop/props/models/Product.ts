import BaseProduct from '../../../dashboard/props/models/Product';

export default interface Product extends BaseProduct {
    reservation?: {
        address: 'no';
        birth_date: 'no';
        fields: Array<{
            id?: number;
            type?: 'text' | 'number';
            label?: string;
            required?: boolean;
            description?: string;
        }>;
        phone: 'no';
    };
}
