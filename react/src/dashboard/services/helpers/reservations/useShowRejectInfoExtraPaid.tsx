import useOpenModal from '../../../hooks/useOpenModal';
import { useCallback } from 'react';
import ModalDangerZone from '../../../components/modals/ModalDangerZone';
import React from 'react';

export default function useShowRejectInfoExtraPaid() {
    const openModal = useOpenModal();

    return useCallback(() => {
        openModal((modal) => (
            <ModalDangerZone
                modal={modal}
                title={'De bijbetaling van deze reservering is al betaald.'}
                description_text={'Na het terugbetalen in Mollie, kunt u deze reservering annuleren.'}
                buttonCancel={{ text: 'Annuleren', onClick: modal.close }}
            />
        ));
    }, [openModal]);
}
