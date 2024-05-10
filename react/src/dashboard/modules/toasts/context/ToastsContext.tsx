import React, { createContext, useCallback, useState } from 'react';

interface ToastMemo {
    setToast: (description?: string) => void;
    getToast: () => void;
    toast: { show: boolean; description: string };
}

const toastsContext = createContext<ToastMemo>(null);
const { Provider } = toastsContext;

const ToastsProvider = ({ children }: { children: React.ReactElement }) => {
    const [toast, updateToast] = useState(null);

    const setToast = useCallback((description: string) => {
        updateToast({
            show: !!description,
            description: description,
        });
    }, []);

    const getToast = useCallback(() => {
        return toast;
    }, [toast]);

    return (
        <Provider
            value={{
                setToast,
                getToast,
                toast,
            }}>
            {children}
        </Provider>
    );
};

export { ToastsProvider, toastsContext };
