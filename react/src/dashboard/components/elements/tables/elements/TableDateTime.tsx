import React, { Fragment } from 'react';

export default function TableDateTime({ value }: { value: string }) {
    if (!value || typeof value !== 'string') {
        return <div className={'text-muted'}>-</div>;
    }

    return value.includes(' - ') ? (
        <Fragment>
            <div className="text-primary text-medium">{value?.split(' - ')[0]}</div>
            <div>{value?.split(' - ')[1]}</div>
        </Fragment>
    ) : (
        <Fragment>{value}</Fragment>
    );
}
