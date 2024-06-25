import React, { useCallback } from 'react';
import ModalDangerZone from '../../../modals/ModalDangerZone';
import useOpenModal from '../../../../hooks/useOpenModal';
import useTranslate from '../../../../hooks/useTranslate';

export default function useConfirmReimbursementCategoryDelete() {
    const openModal = useOpenModal();
    const translate = useTranslate();

    return useCallback((): Promise<boolean> => {
        return new Promise((resolve) =>
            openModal((modal) => (
                <ModalDangerZone
                    modal={modal}
                    title={translate('modals.danger_zone.remove_reimbursement_category.title')}
                    description={translate('modals.danger_zone.remove_reimbursement_category.description')}
                    buttonCancel={{
                        text: translate('modals.danger_zone.remove_reimbursement_category.buttons.cancel'),
                        onClick: () => {
                            modal.close();
                            resolve(false);
                        },
                    }}
                    buttonSubmit={{
                        text: translate('modals.danger_zone.remove_reimbursement_category.buttons.confirm'),
                        onClick: () => {
                            modal.close();
                            resolve(true);
                        },
                    }}
                />
            )),
        );
    }, [openModal, translate]);
}
