import RecordType from './RecordType';
import Fund from './Fund';
import PreCheckRecordSetting from './PreCheckRecordSetting';

export default interface PreCheckRecord {
    id: number;
    title: string;
    title_short: string;
    description: string;
    record_type_key: string;
    record_type: RecordType;
    funds: Array<Fund>;
    uncollapsed: boolean;
    record_settings_uncollapsed: boolean;
    record_settings: Array<PreCheckRecordSetting>;
}
