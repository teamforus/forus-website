import React, { createContext, useCallback, useState } from 'react';

interface ToastMemo {
    setToast: (description?: string) => void;
    toast: { description: string };
}

const toastsContext = createContext<ToastMemo>(null);
const { Provider } = toastsContext;

const ToastsProvider = ({ children }: { children: React.ReactElement }) => {
    const [toast, updateToast] = useState<{ description: string }>(null);

    const setToast = useCallback((description: string) => {
        updateToast(description ? { description: description } : null);
    }, []);

    return <Provider value={{ setToast, toast }}>{children}</Provider>;
};

export { ToastsProvider, toastsContext };
