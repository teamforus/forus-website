import React, { useCallback } from 'react';
import useOpenModal from '../../../../hooks/useOpenModal';
import ModalDangerZone from '../../../modals/ModalDangerZone';

export default function useStopActionConfirmation() {
    const openModal = useOpenModal();

    return useCallback((): Promise<boolean> => {
        return new Promise<boolean>((resolve, reject) => {
            openModal((modal) => (
                <ModalDangerZone
                    modal={modal}
                    title="De publicatie van het aanbod wordt van de website verwijderd"
                    description_text={
                        'Hierna kan er van dit aanbod geen gebruik meer worden gemaakt.\n' +
                        'De gebruikte tegoeden blijven bewaard. ' +
                        'Wanneer u de subsidie opnieuw start, worden de gebruikte tegoeden verrekend met het nieuwe ingestelde limiet.'
                    }
                    buttonCancel={{
                        text: 'Annuleer',
                        onClick: () => {
                            modal.close();
                            reject();
                        },
                    }}
                    buttonSubmit={{
                        text: 'Stop subsidie',
                        onClick: () => {
                            modal.close();
                            resolve(true);
                        },
                    }}
                />
            ));
        });
    }, [openModal]);
}
