import React, { Fragment, useContext, useEffect } from 'react';
import { toastsContext } from '../context/ToastsContext';

export default function Toasts() {
    const { toast, setToast } = useContext(toastsContext);

    useEffect(() => {
        if (toast?.show) {
            window.setTimeout(() => {
                setToast('');
            }, 5000);
        }
    }, [setToast, toast]);

    return (
        <Fragment>
            {toast?.show && (
                <div className="block block-toast">
                    {toast.description && <div className="block-toast-description">{toast.description}</div>}
                </div>
            )}
        </Fragment>
    );
}
