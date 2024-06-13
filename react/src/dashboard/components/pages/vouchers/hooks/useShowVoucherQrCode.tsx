import React, { useCallback } from 'react';
import Voucher from '../../../../props/models/Voucher';
import ModalVoucherQRCode from '../../../modals/ModalVoucherQRCode';
import Organization from '../../../../props/models/Organization';
import useOpenModal from '../../../../hooks/useOpenModal';
import Fund from '../../../../props/models/Fund';

export default function useShowVoucherQrCode() {
    const openModal = useOpenModal();

    return useCallback(
        (organization: Organization, voucher: Voucher, fund: Partial<Fund>, onChange?: () => void) => {
            openModal((modal) => (
                <ModalVoucherQRCode
                    fund={fund}
                    modal={modal}
                    voucher={voucher}
                    organization={organization}
                    onSent={onChange}
                    onAssigned={onChange}
                />
            ));
        },
        [openModal],
    );
}
