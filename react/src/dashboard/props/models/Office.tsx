import Media from './Media';
import BusinessType from './BusinessType';
import OfficeSchedule from "./OfficeSchedule";

export default interface Office {
    id: number;
    organization_id: number;
    address: string;
    phone: string;
    lon: string;
    lat: string;
    postcode: string;
    postcode_number: string;
    postcode_addition: string;
    photo?: Media;
    branch_number?: string;
    branch_name?: string;
    branch_id?: string;
    organization: {
        id: number;
        name: string;
        business_type_id: number;
        email_public: boolean;
        phone_public: boolean;
        website_public: boolean;
        email?: string;
        phone?: string;
        website?: string;
        logo?: Media;
        business_type: BusinessType;
    };
    schedule: Array<OfficeSchedule>;
}
