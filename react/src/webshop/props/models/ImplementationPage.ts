import Media from '../../../dashboard/props/models/Media';

type ImplementationPage = {
    page_type?: string;
    external: boolean;
    title?: string;
    description_position: 'after' | 'before' | 'replace';
    description_alignment: 'left' | 'center' | 'right';
    blocks_per_row: number;
    description_html: string;
    external_url: string;
    blocks: Array<{
        id: number;
        label: string;
        title: string;
        description: string;
        description_html: string;
        button_text: string;
        button_link: string;
        button_target_blank: boolean;
        button_enabled: boolean;
        button_link_label: string;
        media: Media;
    }>;
    faq: Array<{
        id: number;
        title: string;
        description: string;
        description_html: string;
    }>;
};

export default ImplementationPage;
