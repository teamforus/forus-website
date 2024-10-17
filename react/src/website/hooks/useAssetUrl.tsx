import { useCallback } from 'react';
import useEnvData from './useEnvData';
import { assetUrl } from '../../dashboard/helpers/url';
import EnvDataProp from '../../props/EnvData';

export default function useAssetUrl() {
    const envData = useEnvData();

    return useCallback((uri?: string) => assetUrl(uri, envData as unknown as EnvDataProp), [envData]);
}
