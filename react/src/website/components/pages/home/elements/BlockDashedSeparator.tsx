import React from 'react';
import useAssetUrl from '../../../../hooks/useAssetUrl';

export default function BlockDashedSeparator() {
    const assetUrl = useAssetUrl();

    return (
        <div className="block block-dashed-separator">
            <img src={assetUrl(`/assets/img/icon-forus.svg`)} alt="" />
        </div>
    );
}
