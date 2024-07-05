import React, { useContext, useEffect, useRef } from 'react';
import { toastsContext } from '../context/ToastsContext';

export default function Toasts() {
    const { toast, setToast } = useContext(toastsContext);
    const timeoutRef = useRef<number>(null);

    useEffect(() => {
        if (toast) {
            timeoutRef.current = window.setTimeout(() => {
                setToast(null);
            }, 5000);
        }

        return () => {
            window.clearTimeout(timeoutRef.current);
        };
    }, [setToast, toast]);

    if (!toast) {
        return null;
    }

    return (
        <div className="block block-toast">
            {toast.description && <div className="block-toast-description">{toast.description}</div>}
        </div>
    );
}
