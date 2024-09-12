import React, { Fragment } from 'react';
import TableEmptyValue from '../../table-empty-value/TableEmptyValue';

export default function TableDateOnly({ value }: { value: string }) {
    if (!value || typeof value !== 'string') {
        return <TableEmptyValue />;
    }

    return value.includes(' - ') ? (
        <Fragment>
            <div>{value?.split(' - ')[1]}</div>
        </Fragment>
    ) : (
        <Fragment>{value}</Fragment>
    );
}
