export default interface NotificationTemplate {
    id?: number;
    key?: string;
    type?: string;
    title?: string;
    formal?: boolean;
    fund_id?: number;
    content?: string;
    content_html?: string;
    implementation_id?: number;
}