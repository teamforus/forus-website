import EnvDataWebshopProp from '../../../props/EnvDataWebshopProp';
import TagManager from 'react-gtm-module';
import { useEffect } from 'react';

export default function GoogleTagManager({ envData }: { envData: EnvDataWebshopProp }) {
    useEffect(() => {
        if (envData?.config?.tag_manager_id) {
            TagManager.initialize({ gtmId: envData?.config?.tag_manager_id });
        }
    }, [envData?.config?.tag_manager_id]);

    return null;
}
