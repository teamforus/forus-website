import React, { useEffect } from 'react';
import useAuthIdentity from '../../../hooks/useAuthIdentity';
import useSetTitle from '../../../hooks/useSetTitle';

export default function Home() {
    const authIdentity = useAuthIdentity();
    const setTitle = useSetTitle();

    useEffect(() => {
        setTitle('Home page.');
    }, [setTitle]);

    return (
        <div className={'wrapper'}>
            <h2>Home page</h2>
            <hr />
            <h4>Hello, {authIdentity?.email || authIdentity?.address || 'Guest'}!.</h4>
        </div>
    );
}
