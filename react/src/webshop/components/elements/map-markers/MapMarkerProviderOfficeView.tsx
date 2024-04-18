import React from 'react';
import Office from '../../../../dashboard/props/models/Office';
import useAssetUrl from '../../../hooks/useAssetUrl';

export default function MapMarkerProviderOfficeView({ office }: { office: Office }) {
    const assetUrl = useAssetUrl();

    return (
        <div className="block block-map-office-card">
            <div className="map-office-photo">
                <img
                    src={
                        office?.photo?.sizes?.thumbnail ||
                        office?.organization?.logo?.sizes?.thumbnail ||
                        assetUrl('assets/img/placeholders/office-thumbnail.png')
                    }
                    alt="office photo"
                />
            </div>
            <div className="map-office-details">
                <div className="map-office-title">{office.organization.name}</div>
                <div className="row">
                    <div className="col col-lg-12">
                        <div className="map-office-info">
                            <div className="mdi mdi-map-marker-outline text-muted" />
                            <span className="text-primary">{office.address}</span>
                        </div>
                    </div>
                    <div className="col col-lg-12">
                        {(office.phone || office.organization.phone) && (
                            <div className="map-office-info map-office-info-inline">
                                <div className="mdi mdi-phone-outline text-muted" />
                                <span className="text-primary">
                                    {office.phone ? office.phone : office.organization.phone}
                                </span>
                            </div>
                        )}

                        {office.organization.email && (
                            <div className="map-office-info map-office-info-inline">
                                <div className="mdi mdi-email-outline text-muted" />
                                <span className="text-primary">{office.organization.email}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
