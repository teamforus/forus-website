import Media from './Media';

export default interface ImplementationPageBlock {
    id?: number;
    label?: string;
    title?: string;
    media?: Media;
    media_uid?: string;
    description?: string;
    description_html?: string;
    button_text?: string;
    button_link?: string;
    button_link_label?: string;
    button_enabled?: boolean;
    button_target_blank?: boolean;
}
