import { useCallback, useContext } from 'react';
import { mainContext } from '../contexts/MainContext';

export default function useSetTitle() {
    const { setTitle } = useContext(mainContext);

    return useCallback(
        (title: string) => {
            setTimeout(() => setTitle(title), 0);
        },
        [setTitle],
    );
}
