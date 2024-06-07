import { useEffect } from 'react';
import EnvDataWebshopProp from '../../../props/EnvDataWebshopProp';

export default function SiteImproveAnalytics({ envData }: { envData: EnvDataWebshopProp }) {
    const { site_improve_analytics_id } = envData?.config || {};

    useEffect(() => {
        if (!site_improve_analytics_id) {
            return;
        }

        const sz = document.createElement('script');
        sz.type = 'text/javascript';
        sz.async = true;
        sz.src = `https://siteimproveanalytics.com/js/siteanalyze_${site_improve_analytics_id}.js`;

        const s = document.getElementsByTagName('script')[0];
        s.parentNode.insertBefore(sz, s);
    }, [site_improve_analytics_id]);

    return null;
}
