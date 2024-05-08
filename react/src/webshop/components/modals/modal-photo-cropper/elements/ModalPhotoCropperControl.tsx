import React, { useCallback } from 'react';
import ImageCropper from '../../../../../dashboard/components/elements/image_cropper/ImageCropper';
import { ModalPhotoCropperFile } from '../ModalPhotoCropper';

export default function ModalPhotoCropperControl({
    file,
    onCropperChange,
}: {
    file: ModalPhotoCropperFile;
    onCropperChange: (file: ModalPhotoCropperFile, previewData: Blob) => void;
}) {
    const onChange = useCallback(
        (presets) => {
            onCropperChange(file, presets[0]?.blob);
        },
        [file, onCropperChange],
    );

    return (
        <ImageCropper
            file={file.file}
            presets={[{ width: null, height: null }]}
            initialWidth={100}
            onChange={onChange}
        />
    );
}
