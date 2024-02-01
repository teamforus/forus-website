import Reservation from '../../../props/models/Reservation';
import useOpenModal from '../../../hooks/useOpenModal';
import { useCallback } from 'react';
import ModalDangerZone from '../../../components/modals/ModalDangerZone';
import React from 'react';

export default function useConfirmReservationApproval() {
    const openModal = useOpenModal();

    return useCallback(
        (reservation: Reservation, onConfirm: () => void) => {
            openModal((modal) => (
                <ModalDangerZone
                    modal={modal}
                    description_title="Weet u zeker dat u de reservering wilt accepteren?"
                    description_text={[
                        `U staat op het punt om een reservering te accepteren voor het aanbod `,
                        `${reservation.product.name} voor ${reservation.amount_locale}\n`,
                        `U kunt de transactie annuleren binnen 14 dagen, daarna volgt de uitbetaling`,
                    ].join('\n')}
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
