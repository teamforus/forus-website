import React, { useCallback } from 'react';
import ModalPdfPreview from '../../components/modals/ModalPdfPreview';
import ModalImagePreview from '../../components/modals/ModalImagePreview';
import useOpenModal from '../../hooks/useOpenModal';
import usePushDanger from '../../hooks/usePushDanger';
import File from '../../props/models/File';
import { useFileService } from '../FileService';

export default function useFilePreview() {
    const openModal = useOpenModal();
    const fileService = useFileService();
    const pushDanger = usePushDanger();

    return useCallback(
        (file: File) => {
            if (file.ext == 'pdf') {
                fileService.downloadBlob(file).then(
                    (res) => openModal((modal) => <ModalPdfPreview modal={modal} rawPdfFile={res.data} />),
                    (res) => pushDanger('Mislukt!', res.data?.message),
                );
            } else if (['png', 'jpeg', 'jpg'].includes(file.ext)) {
                openModal((modal) => <ModalImagePreview modal={modal} imageSrc={file.url} />);
            }
        },
        [fileService, openModal, pushDanger],
    );
}
