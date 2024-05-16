import { useCallback } from 'react';
import { useClipboardService } from '../services/ClipboardService';
import usePushSuccess from './usePushSuccess';

export default function useCopyToClipboard() {
    const pushSuccess = usePushSuccess();
    const clipboardService = useClipboardService();

    return useCallback(
        (str: string) => {
            clipboardService.copy(str).then(() => pushSuccess('Gekopieerd naar het klembord.'));
        },
        [clipboardService, pushSuccess],
    );
}
