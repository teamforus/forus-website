import React, { Fragment, useContext } from 'react';
import { printableContext } from '../context/PrintableContext';

export default function Printable() {
    const { printableItems } = useContext(printableContext);

    return (
        <div className={'printables-root'}>
            {printableItems.map((printable) => (
                <Fragment key={printable.id}>{printable.builder(printable)}</Fragment>
            ))}
        </div>
    );
}
