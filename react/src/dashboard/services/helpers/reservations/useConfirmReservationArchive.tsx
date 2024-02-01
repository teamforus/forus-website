import Reservation from '../../../props/models/Reservation';
import useOpenModal from '../../../hooks/useOpenModal';
import { useCallback } from 'react';
import ModalDangerZone from '../../../components/modals/ModalDangerZone';
import React from 'react';

export default function useConfirmReservationArchive() {
    const openModal = useOpenModal();

    return useCallback(
        (reservation: Reservation, onConfirm: () => void) => {
            openModal((modal) => (
                <ModalDangerZone
                    modal={modal}
                    description_title={'Reservering archiveren'}
                    description_text={`De reservering voor het aanbod ${reservation.product.name} wordt gearchiveerd.`}
                    buttonCancel={{ text: 'Annuleren', onClick: modal.close }}
                    buttonSubmit={{
                        text: 'Bevestigen',
                        onClick: () => {
                            onConfirm();
                            modal.close();
                        },
                    }}
                />
            ));
        },
        [openModal],
    );
}
