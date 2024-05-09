import React, { Fragment } from 'react';
import ProvidersListItemList from './templates/ProvidersListItemList';
import ProvidersListItemSearch from './templates/ProvidersListItemSearch';
import Provider from '../../../../props/models/Provider';

export default function ProvidersListItem({
    provider,
    display = 'list',
    searchParams = null,
}: {
    provider: Provider;
    display: 'list' | 'search';
    searchParams?: object;
}) {
    return (
        <Fragment>
            {display === 'list' && <ProvidersListItemList searchParams={searchParams} provider={provider} />}
            {display === 'search' && <ProvidersListItemSearch searchParams={searchParams} provider={provider} />}
        </Fragment>
    );
}
