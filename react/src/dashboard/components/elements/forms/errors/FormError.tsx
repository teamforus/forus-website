import React, { Fragment, useMemo } from 'react';

export default function FormError({ error, className = '' }: { error?: string | Array<string>; className?: string }) {
    const errorsList = useMemo(() => (error ? (Array.isArray(error) ? error : [error]) : []), [error]);

    return (
        <Fragment>
            {errorsList.map((error, index) => (
                <div className={`form-error ${className}`} key={index}>
                    {error}
                </div>
            ))}
        </Fragment>
    );
}
