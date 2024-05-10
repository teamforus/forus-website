import Media from '../../../dashboard/props/models/Media';
import Office from '../../../dashboard/props/models/Office';

export default interface Provider {
    id: number;
    name: string;
    description?: string;
    description_html?: string;
    business_type_id?: number;
    email?: string;
    phone?: string;
    business_type?: {
        id: number;
        key: string;
        name: string;
    };
    offices: Array<Office>;
    logo?: Media;
}
