import usePushDanger from './usePushDanger';
import { useCallback } from 'react';
import { ResponseError } from '../props/ApiResponses';

export default function usePushApiError() {
    const pushDanger = usePushDanger();

    return useCallback(
        (err: ResponseError) => {
            pushDanger('Mislukt!', err.data.message);
        },
        [pushDanger],
    );
}
