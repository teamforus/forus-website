import React, { Fragment, ReactNode } from 'react';
import LoadingCard from '../loading-card/LoadingCard';
import EmptyCard from '../empty-card/EmptyCard';

export default function LoaderTableCard({
    empty = false,
    emptyText = '',
    loading = false,
    children,
}: {
    empty?: boolean;
    emptyText?: string;
    loading?: boolean;
    children: ReactNode | Array<ReactNode>;
}) {
    if (loading) {
        return <LoadingCard type={'section-card'} />;
    }

    if (empty) {
        return <EmptyCard type={'card-section'} title={emptyText || 'Niets gevonden'} />;
    }

    return <Fragment>{children}</Fragment>;
}
