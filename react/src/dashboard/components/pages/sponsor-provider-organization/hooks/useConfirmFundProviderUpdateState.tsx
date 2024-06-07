import React, { useCallback } from 'react';
import useOpenModal from '../../../../hooks/useOpenModal';
import ModalDangerZone from '../../../modals/ModalDangerZone';
import useTranslate from '../../../../hooks/useTranslate';

export default function useConfirmFundProviderUpdateState() {
    const translate = useTranslate();
    const openModal = useOpenModal();

    return useCallback(
        (state: 'accepted' | 'rejected') => {
            return new Promise<{ state: 'accepted' | 'rejected' }>((resolve, reject) => {
                openModal((modal) => (
                    <ModalDangerZone
                        modal={modal}
                        title={translate(`modals.danger_zone.sponsor_provider_organization_state.${state}.title`)}
                        description_text={translate(
                            `modals.danger_zone.sponsor_provider_organization_state.${state}.description`,
                        )}
                        buttonCancel={{
                            text: translate(
                                `modals.danger_zone.sponsor_provider_organization_state.${state}.buttons.cancel`,
                            ),
                            onClick: () => {
                                modal.close();
                                reject();
                            },
                        }}
                        buttonSubmit={{
                            text: translate(
                                `modals.danger_zone.sponsor_provider_organization_state.${state}.buttons.confirm`,
                            ),
                            onClick: () => {
                                modal.close();
                                resolve({ state });
                            },
                        }}
                    />
                ));
            });
        },
        [openModal, translate],
    );
}
