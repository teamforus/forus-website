import React, { Fragment, ReactNode } from 'react';
import LoadingCard from '../loading-card/LoadingCard';
import EmptyCard from '../empty-card/EmptyCard';

export default function LoaderTableCard({
    empty = false,
    emptyTitle = '',
    emptyDescription = null,
    loading = false,
    children,
}: {
    empty?: boolean;
    emptyTitle?: string;
    emptyDescription?: string;
    loading?: boolean;
    children: ReactNode | Array<ReactNode>;
}) {
    if (loading) {
        return <LoadingCard type={'card-section'} />;
    }

    if (empty) {
        return (
            <EmptyCard type={'card-section'} title={emptyTitle || 'Niets gevonden'} description={emptyDescription} />
        );
    }

    return <Fragment>{children}</Fragment>;
}
