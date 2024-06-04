import React from 'react';
import useOpenModal from '../../../dashboard/hooks/useOpenModal';
import { useCallback } from 'react';
import ModalNotification from '../../components/modals/ModalNotification';

export default function useShowTakenByPartnerModal() {
    const openModal = useOpenModal();

    return useCallback(() => {
        openModal((modal) => (
            <ModalNotification
                modal={modal}
                type="info"
                title="Tegoed activeren"
                header="Dit tegoed is al geactiveerd"
                mdiIconType="warning"
                mdiIconClass="alert-outline"
                closeBtnText="Bevestigen"
                description={[
                    'U krijgt deze melding omdat het tegoed is geactiveerd door een ',
                    'famielid of voogd. De tegoeden zijn beschikbaar in het account ',
                    'van de persoon die deze als eerste heeft geactiveerd.',
                ].join('')}
            />
        ));
    }, [openModal]);
}
