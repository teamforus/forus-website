import { useContext } from 'react';
import { authContext } from '../contexts/AuthContext';

export default function useAuthIdentity2FAState() {
    return useContext(authContext).identity2FAState;
}
