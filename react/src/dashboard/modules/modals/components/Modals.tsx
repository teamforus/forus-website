import React, { useCallback, useContext, useEffect, useMemo, useRef } from 'react';
import { modalsContext } from '../context/ModalContext';

export default function Modals() {
    const { modals, closeModal } = useContext(modalsContext);
    const visibleModals = useMemo(() => modals.filter((modal) => !modal.hidden), [modals]);

    const modalRef = useRef<HTMLDivElement>(null);

    const focusModalElement = useCallback(() => {
        const element: Element = modalRef.current?.querySelector(
            [
                'a[href], area[href], input:not([disabled]), select:not([disabled])',
                'textarea:not([disabled]), button:not([disabled]), iframe, object',
                'embed, *[tabindex], *[contenteditable]',
            ].join(', '),
        );

        element?.['focus']?.();
    }, []);

    useEffect(() => {
        if (visibleModals.length === 0) {
            return;
        }

        focusModalElement();

        const onActiveFocusIn = () => {
            if (modalRef.current && !modalRef.current?.contains(document.activeElement)) {
                focusModalElement();
            }
        };

        document.addEventListener('focusin', onActiveFocusIn);

        return () => document.removeEventListener('focusin', onActiveFocusIn);
    }, [visibleModals.length, focusModalElement]);

    return (
        <div className={'modals'}>
            {visibleModals.map((modal, index) => (
                <div
                    tabIndex={index === visibleModals.length - 1 ? 0 : -1}
                    onKeyDown={(e) => {
                        if (index === visibleModals.length - 1 && e.code == 'Escape') {
                            closeModal(modal);
                        }
                    }}
                    key={modal.id}
                    ref={index === visibleModals.length - 1 ? modalRef : null}>
                    {modal.builder(modal)}
                </div>
            ))}
        </div>
    );
}
