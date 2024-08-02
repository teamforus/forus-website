import { useCallback } from 'react';
import { assetUrl } from '../../dashboard/helpers/url';
import EnvDataProp from '../../props/EnvData';
import useEnvData from './useEnvData';

export default function useAssetUrl() {
    const envData = useEnvData();

    return useCallback((uri?: string) => assetUrl(uri, envData as unknown as EnvDataProp), [envData]);
}
