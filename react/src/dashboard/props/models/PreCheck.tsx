import PreCheckRecord from './PreCheckRecord';

export default interface PreCheck {
    id?: number;
    uid?: string;
    default?: boolean;
    implementation_id?: number;
    order?: number;
    label: string;
    title: string;
    title_short?: string;
    description?: string;
    created_at_locale?: string;
    record_types: Array<PreCheckRecord>;
    uncollapsed: boolean;
}
