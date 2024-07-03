import { useContext } from 'react';
import { toastsContext } from '../modules/toasts/context/ToastsContext';

export default function useSetToast() {
    return useContext(toastsContext).setToast;
}
