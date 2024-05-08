import React, { useCallback } from 'react';
import useOpenModal from '../../../../hooks/useOpenModal';
import ModalDangerZone from '../../../modals/ModalDangerZone';
import { useTranslation } from 'react-i18next';

export default function useConfirmFundProviderUpdateState() {
    const { t } = useTranslation();
    const openModal = useOpenModal();

    return useCallback(
        (state: string): Promise<object> => {
            return new Promise<object>((resolve, reject) => {
                openModal((modal) => (
                    <ModalDangerZone
                        modal={modal}
                        title={t(`modals.danger_zone.sponsor_provider_organization_state.${state}.title`)}
                        description_text={t(
                            `modals.danger_zone.sponsor_provider_organization_state.${state}.description`,
                        )}
                        buttonCancel={{
                            text: t(`modals.danger_zone.sponsor_provider_organization_state.${state}.buttons.cancel`),
                            onClick: () => {
                                modal.close();
                                reject();
                            },
                        }}
                        buttonSubmit={{
                            text: t(`modals.danger_zone.sponsor_provider_organization_state.${state}.buttons.confirm`),
                            onClick: () => {
                                modal.close();
                                resolve({ state });
                            },
                        }}
                    />
                ));
            });
        },
        [openModal, t],
    );
}
