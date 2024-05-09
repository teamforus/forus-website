import RecordType from '../../../dashboard/props/models/RecordType';
import Media from '../../../dashboard/props/models/Media';

export default interface PreCheck<E = object> {
    id: number;
    title: string;
    title_short: string;
    description: string;
    default: boolean;
    record_types: Array<
        {
            id?: number;
            record_type_key: string;
            title: string;
            title_short: string;
            description: string;
            order: number;
            pre_check_id: number;
            record_settings: Array<{
                id: number;
                fund_id: number;
                description?: string;
                impact_level: number;
                is_knock_out: boolean;
                fund_name: string;
                fund_logo: Media;
                implementation_name: string;
                implementation_url_webshop: string;
            }>;
            value: string;
            funds: Array<{
                id: number;
                name: string;
                implementation: { id: number; name: string; url_webshop: string };
            }>;
            record_type: RecordType;
        } & E
    >;
}
