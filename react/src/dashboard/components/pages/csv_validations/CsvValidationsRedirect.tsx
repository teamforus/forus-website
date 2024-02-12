import React, { useEffect } from 'react';
import 'react-image-crop/dist/ReactCrop.css';
import useAppConfigs from '../../../hooks/useAppConfigs';

export default function CsvValidationsRedirect() {
    const appConfigs = useAppConfigs();

    useEffect(() => {
        if (appConfigs) {
            document.location = appConfigs.fronts.url_sponsor + 'csv-validation/funds';
        }
    }, [appConfigs]);
    return <></>;
}
