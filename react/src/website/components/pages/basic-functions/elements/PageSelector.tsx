import React, { useState } from 'react';
import useAssetUrl from '../../../../hooks/useAssetUrl';
import StateNavLink from '../../../../modules/state_router/StateNavLink';

export default function PageSelector({ activeType }: { activeType: string }) {
    const assetUrl = useAssetUrl();

    const [pageTypes] = useState([
        {
            key: 'me-app',
            name: 'Me-app',
            stateName: 'me-app',
        },
        {
            key: 'cms',
            name: 'CMS',
            stateName: 'cms',
        },
        {
            key: 'funds',
            name: 'Fondsen',
            stateName: 'funds',
        },
        {
            key: 'information',
            name: 'Managementinformatie',
            stateName: 'information',
        },
        {
            key: 'website',
            name: 'Websites',
            stateName: 'website',
        },
    ]);

    return (
        <div className="block block-roles-selector">
            {pageTypes.map((pageType, index) => (
                <StateNavLink name={pageType.stateName} className={'block-roles-selector-item'} key={index}>
                    <img
                        src={assetUrl(
                            `/assets/img/icons-basic-functions/selector/${pageType.key}-${
                                pageType.key === activeType ? 'active' : 'normal'
                            }.svg`,
                        )}
                        alt=""
                    />
                    {pageType.name}

                    {pageType.key === activeType && <div className="separator-bottom" />}
                </StateNavLink>
            ))}
        </div>
    );
}
