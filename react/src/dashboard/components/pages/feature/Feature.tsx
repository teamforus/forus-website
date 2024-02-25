import React, { Fragment, useCallback, useEffect, useState } from 'react';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import { useOrganizationService } from '../../../services/OrganizationService';
import { useFeatureService } from '../../../services/FeaturesService';
import useAssetUrl from '../../../hooks/useAssetUrl';
import OrganizationFeature from '../../../props/models/OrganizationFeature';
import ModalFeatureContact from '../../modals/ModalFeatureContact';
import useOpenModal from '../../../hooks/useOpenModal';
import { snakeCase } from 'lodash';
import { useParams } from 'react-router-dom';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import LoadingCard from '../../elements/loading-card/LoadingCard';
import BiTools from './items/BiTools';
import EmailConnection from './items/EmailConnection';
import BackofficeApi from './items/BackofficeApi';
import IconnectApi from './items/IconnectApi';
import Digid from './items/Digid';
import BNG from './items/BNG';
import Reimbursements from './items/Reimbursements';
import Auth2Fa from './items/Auth2Fa';
import PhysicalCards from './items/PhysicalCards';
import VoucherRecords from './items/VoucherRecords';
import ExtraPayments from './items/ExtraPayments';
import FundRequests from './items/FundRequests';

export default function Feature() {
    const { key } = useParams();
    const activeOrganization = useActiveOrganization();
    const organizationService = useOrganizationService();
    const featureService = useFeatureService();
    const assetUrl = useAssetUrl();
    const openModal = useOpenModal();

    const [feature, setFeature] = useState<OrganizationFeature>(null);
    const [additionalFeatures, setAdditionalFeatures] = useState<Array<OrganizationFeature>>([]);
    const [featureStatuses, setFeatureStatuses] = useState({});

    const openContactModal = useCallback(() => {
        openModal((modal) => <ModalFeatureContact modal={modal} />);
    }, [openModal]);

    useEffect(() => {
        organizationService
            .getFeatures(activeOrganization.id)
            .then((res) => setFeatureStatuses(res.data.data.statuses));
    }, [activeOrganization.id, organizationService]);

    useEffect(() => {
        const item = featureService.list
            .map((feature) => ({
                ...feature,
                enabled: featureStatuses[feature.key] || false,
            }))
            .filter((feature) => feature.key === snakeCase(key))[0];

        setFeature(item);
    }, [featureService, featureStatuses, key]);

    useEffect(() => {
        if (feature) {
            const items = featureService.getAdditionalFeatures(feature.key).map((feature) => ({
                ...feature,
                enabled: featureStatuses[feature.key] || false,
            }));

            setAdditionalFeatures(items);
        }
    }, [feature, featureService, featureStatuses, key]);

    if (!feature) {
        return <LoadingCard />;
    }

    return (
        <Fragment>
            <div className="block block-breadcrumbs">
                <StateNavLink
                    name={'features'}
                    params={{
                        organizationId: activeOrganization.id,
                    }}
                    className="breadcrumb-item">
                    Marketplace
                </StateNavLink>
                <div className="breadcrumb-item active">{feature.name}</div>
            </div>

            <div className="card">
                <div className="card-section">
                    <div className="block block-feature">
                        <div className="block-feature-icon">
                            <img src={assetUrl(`/assets/img/features/icons/${feature.key}.svg`)} alt={feature.name} />
                        </div>
                        <div className="block-feature-info">
                            <div className="block-feature-title">
                                <span>{feature.name}</span>
                                {feature.enabled ? (
                                    <div className="block-feature-label active">Actief</div>
                                ) : (
                                    <div className="block-feature-label inactive">Uitproberen</div>
                                )}
                            </div>
                            <div className="block-feature-details">{feature.description}</div>
                            <div className="block-feature-labels">
                                {feature.labels.map((label, index) => (
                                    <div key={index} className="block-feature-label">
                                        {label}
                                    </div>
                                ))}
                            </div>
                            <div className="button-group">
                                <div className="button button-primary button-sm" onClick={() => openContactModal()}>
                                    Contact opnemen
                                </div>
                                <a
                                    className="button button-default button-sm"
                                    href="https://helpcentrum.forus.io/kb/nl"
                                    rel="noreferrer"
                                    target="_blank">
                                    Helpcenter-artikelen bekijken
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {feature.key === 'bi_tools' && (
                <BiTools
                    feature={feature}
                    additionalFeatures={additionalFeatures}
                    organization={activeOrganization}
                    openContactModal={openContactModal}
                />
            )}

            {feature.key === 'email_connection' && (
                <EmailConnection
                    feature={feature}
                    additionalFeatures={additionalFeatures}
                    organization={activeOrganization}
                    openContactModal={openContactModal}
                />
            )}

            {feature.key === 'backoffice_api' && (
                <BackofficeApi
                    feature={feature}
                    additionalFeatures={additionalFeatures}
                    organization={activeOrganization}
                    openContactModal={openContactModal}
                />
            )}

            {feature.key === 'iconnect_api' && (
                <IconnectApi
                    feature={feature}
                    additionalFeatures={additionalFeatures}
                    organization={activeOrganization}
                    openContactModal={openContactModal}
                />
            )}

            {feature.key === 'digid' && (
                <Digid
                    feature={feature}
                    additionalFeatures={additionalFeatures}
                    organization={activeOrganization}
                    openContactModal={openContactModal}
                />
            )}

            {feature.key === 'bng' && (
                <BNG
                    feature={feature}
                    additionalFeatures={additionalFeatures}
                    organization={activeOrganization}
                    openContactModal={openContactModal}
                />
            )}

            {feature.key === 'reimbursements' && (
                <Reimbursements
                    feature={feature}
                    additionalFeatures={additionalFeatures}
                    organization={activeOrganization}
                    openContactModal={openContactModal}
                />
            )}

            {feature.key === 'auth_2_fa' && (
                <Auth2Fa
                    feature={feature}
                    additionalFeatures={additionalFeatures}
                    organization={activeOrganization}
                    openContactModal={openContactModal}
                />
            )}

            {feature.key === 'physical_cards' && (
                <PhysicalCards
                    feature={feature}
                    additionalFeatures={additionalFeatures}
                    organization={activeOrganization}
                    openContactModal={openContactModal}
                />
            )}

            {feature.key === 'voucher_records' && (
                <VoucherRecords
                    feature={feature}
                    additionalFeatures={additionalFeatures}
                    organization={activeOrganization}
                    openContactModal={openContactModal}
                />
            )}

            {feature.key === 'extra_payments' && (
                <ExtraPayments
                    feature={feature}
                    additionalFeatures={additionalFeatures}
                    organization={activeOrganization}
                    openContactModal={openContactModal}
                />
            )}

            {feature.key === 'fund_requests' && (
                <FundRequests
                    feature={feature}
                    additionalFeatures={additionalFeatures}
                    organization={activeOrganization}
                    openContactModal={openContactModal}
                />
            )}
        </Fragment>
    );
}
