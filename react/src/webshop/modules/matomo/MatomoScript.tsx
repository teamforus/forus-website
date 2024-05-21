import { useEffect } from 'react';
import EnvDataWebshopProp from '../../../props/EnvDataWebshopProp';

export default function MatomoScript({ envData }: { envData: EnvDataWebshopProp }) {
    const { matomo_url, matomo_site_id } = envData?.config || {};

    useEffect(() => {
        if (!matomo_url || !matomo_site_id) {
            return;
        }

        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.async = true;
        script.defer = true;
        script.src = `${matomo_url}/matomo.js`;
        document.body.appendChild(script);

        window['_paq'] = window['_paq'] || [];
        window['_paq'].push(['trackPageView']);
        window['_paq'].push(['enableLinkTracking']);
        window['_paq'].push(['setTrackerUrl', `${matomo_url}/matomo.php`]);
        window['_paq'].push(['setSiteId', matomo_site_id]);
    }, [matomo_site_id, matomo_url]);

    return null;
}
