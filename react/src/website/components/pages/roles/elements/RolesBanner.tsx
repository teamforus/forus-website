import React, { useMemo } from 'react';
import useAssetUrl from '../../../../hooks/useAssetUrl';

export default function RolesBanner({
    type,
    title,
    description,
    showActions = true,
    showIcon = true,
}: {
    type: string;
    title: string;
    description: string;
    showActions?: boolean;
    showIcon?: boolean;
}) {
    const assetUrl = useAssetUrl();

    const iconTypeText = useMemo(() => {
        switch (type) {
            case 'requester':
                return 'deelnemers';
            case 'sponsor':
                return 'sponsor';
            case 'provider':
                return 'aanbieders';
            case 'validator':
                return 'beoordelaards';
        }
    }, [type]);

    return (
        <div className={`block block-role-banner block-role-banner-${type}`}>
            <div className="banner-content">
                <div className="banner-info">
                    {showIcon && (
                        <div className="banner-icon">
                            <img
                                src={assetUrl(`/assets/img/icons-roles/selector/${type}-active.svg`)}
                                alt={`Icoon van de ${iconTypeText}rol in het Forus-systeem`}
                            />
                        </div>
                    )}
                    <h2 className="banner-title">{title}</h2>
                    <div className="banner-description banner-description-sm">{description}</div>

                    {showActions && (
                        <div className="button-group banner-actions">
                            <div className="button button-primary">Gratis demo</div>
                            <div className="button button-dark">Lees ons verhaal</div>
                        </div>
                    )}
                </div>

                <div className="banner-image">
                    <div className="overlay" />
                    <div className="image" />
                </div>
            </div>
        </div>
    );
}
