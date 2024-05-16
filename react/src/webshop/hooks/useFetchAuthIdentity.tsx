import { useCallback, useContext } from 'react';
import { authContext } from '../contexts/AuthContext';

export default function useFetchAuthIdentity() {
    const { updateIdentity } = useContext(authContext);

    return useCallback(() => updateIdentity(), [updateIdentity]);
}
