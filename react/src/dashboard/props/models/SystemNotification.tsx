export interface NotificationTemplate {
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

export default interface SystemNotification {
    id?: number;
    key?: string;
    title?: string;
    order?: number;
    group?: string;
    optional?: boolean;
    editable?: boolean;
    enable_all?: boolean;
    enable_mail?: boolean;
    enable_push?: boolean;
    enable_database?: boolean;
    variables?: Array<string>;
    channels?: Array<string>;
    templates?: Array<NotificationTemplate>;
    templates_default?: Array<NotificationTemplate>;
}
