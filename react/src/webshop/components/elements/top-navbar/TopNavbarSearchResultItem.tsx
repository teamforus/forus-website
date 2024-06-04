import React, { Fragment } from 'react';

export default function TopNavbarSearchResultItem({ q, name }: { q: string; name: string }) {
    const index = name.toLowerCase().indexOf(q.toLowerCase());

    return index !== -1 ? (
        <Fragment>
            {name.slice(0, index)}
            <strong>{name.slice(index, index + q.length)}</strong>
            {name.slice(index + q.length)}
        </Fragment>
    ) : (
        <Fragment>{name}</Fragment>
    );
}
