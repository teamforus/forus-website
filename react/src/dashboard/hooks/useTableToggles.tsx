import { useCallback, useState } from 'react';

export default function useTableToggles() {
    const [selected, setSelected] = useState([]);

    const toggleAll = useCallback(
        (e, items: Array<{ id: number }>) => {
            e?.stopPropagation();

            setSelected(() => {
                return items.length === selected.length ? [] : items.map((item) => item.id);
            });
        },
        [selected],
    );

    const toggle = useCallback((e, item: { id: number }) => {
        e?.stopPropagation();

        setSelected((selected) => {
            if (selected.includes(item.id)) {
                selected.splice(selected.indexOf(item.id), 1);
            } else {
                selected.push(item.id);
            }

            return [...selected];
        });
    }, []);

    return {
        selected,
        setSelected,
        toggleAll,
        toggle,
    };
}
