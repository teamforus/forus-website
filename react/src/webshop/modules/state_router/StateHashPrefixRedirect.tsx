import { useEffect } from 'react';

export default function StateHashPrefixRedirect({ from = '#!/', to = '#/' }: { from?: string; to?: string }) {
    useEffect(() => {
        const handlePopState = () => {
            if (document.location.hash?.startsWith(from)) {
                document.location.href = document.location.href.replace(from, to);
            }
        };

        window.addEventListener('popstate', handlePopState);
        handlePopState();

        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
    }, [from, to]);

    return null;
}
