import Media from './Media';

export default interface PreCheckRecordSetting {
    id: number;
    pre_check_record_id: number;
    fund_id: number;
    description: string;
    impact_level: number;
    is_knock_out: boolean;
    fund_logo: Media;
    fund_name: string;
    implementation_url_webshop: string;
    implementation_name: string;
}
