import React, { ReactElement, useCallback, useEffect, useRef } from 'react';

export default function TableTopScroller({ children }: { children: ReactElement | ReactElement[] }) {
    const tableScrollWrapperRef = useRef<HTMLDivElement>(null);
    const tableScrollTopRef = useRef<HTMLDivElement>(null);
    const tableScrollTopContentRef = useRef<HTMLDivElement>(null);

    const handleResize = useCallback((enabled = true) => {
        if (enabled && tableScrollWrapperRef.current) {
            tableScrollTopRef.current.style.width = `${tableScrollWrapperRef.current.offsetWidth}px`;
            tableScrollTopContentRef.current.style.width = `${tableScrollWrapperRef.current.scrollWidth}px`;
            tableScrollTopContentRef.current.style.height = `1px`;
        }
    }, []);

    useEffect(() => {
        // Initial width and scrollWidth set
        handleResize();

        window.addEventListener('resize', handleResize);

        const observer = new MutationObserver(handleResize);

        if (tableScrollWrapperRef.current) {
            observer.observe(tableScrollWrapperRef.current, { childList: true, subtree: true, characterData: true });
        }

        // Cleanup event listener and observer on component unmount
        return () => {
            window.removeEventListener('resize', handleResize);
            observer.disconnect();
        };
    }, [handleResize]);

    return (
        <div className="table-wrapper">
            <div className="table-container">
                <div
                    className="table-scroll-top"
                    ref={tableScrollTopRef}
                    onScroll={(e) => tableScrollWrapperRef.current.scrollTo({ left: e.currentTarget.scrollLeft })}>
                    <div className="table-scroll-top-content" ref={tableScrollTopContentRef} />
                </div>
                <div
                    className="table-scroll"
                    ref={tableScrollWrapperRef}
                    onScroll={(e) => tableScrollTopRef.current.scrollTo({ left: e.currentTarget.scrollLeft })}>
                    {children}
                </div>
            </div>
        </div>
    );
}
