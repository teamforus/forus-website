import React, { useEffect } from 'react';
import useSetTitle from '../../hooks/useSetTitle';

export default function WIP({
    title = 'Work in progress',
    description = 'This page is under construction.',
}: {
    title?: string;
    description?: string;
}) {
    const setTitle = useSetTitle();

    useEffect(() => {
        setTitle(title);
    }, [setTitle, title]);

    return (
        <div className={'wrapper'}>
            <h4>{title}</h4>
            <p>{description}</p>
        </div>
    );
}
