import Media from '../../../../props/models/Media';

export default interface PhotoSelectorData {
    overlay_type: string;
    overlay_enabled: boolean;
    overlay_opacity: string;
    auto_text_color: boolean;
    header_text_color: string;
    mediaLoading: boolean;
    opacityOptions: Array<{
        value: string;
        label: string;
    }>;
    headerTextColors: Array<{
        value: string;
        label: string;
    }>;
    patterns: Array<{
        value: string;
        label: string;
    }>;
    media?: Media;
}
