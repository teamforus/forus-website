import React, { useCallback } from 'react';
import useOpenModal from '../../../dashboard/hooks/useOpenModal';
import ModalNotification from '../../components/modals/ModalNotification';

export default function useConfirmReimbursementDestroy() {
    const openModal = useOpenModal();

    return useCallback((): Promise<boolean> => {
        return new Promise((resolve) => {
            openModal((modal) => (
                <ModalNotification
                    modal={modal}
                    type={'confirm'}
                    title={'Declaratie annuleren?'}
                    description={'Weet je zeker dat je het declaratie verzoek wilt annuleren?'}
                    mdiIconType={'warning'}
                    mdiIconClass="alert-outline"
                    confirmBtnText={'Bevestigen'}
                    onConfirm={() => resolve(true)}
                    onCancel={() => resolve(false)}
                />
            ));
        });
    }, [openModal]);
}
