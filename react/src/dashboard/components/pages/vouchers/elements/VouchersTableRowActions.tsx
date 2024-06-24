import React, { Fragment, useCallback } from 'react';
import Voucher from '../../../../props/models/Voucher';
import TableRowActions from '../../../elements/tables/TableRowActions';
import StateNavLink from '../../../../modules/state_router/StateNavLink';
import { hasPermission } from '../../../../helpers/utils';
import Organization from '../../../../props/models/Organization';
import useShowVoucherQrCode from '../hooks/useShowVoucherQrCode';
import Fund from '../../../../props/models/Fund';

export default function VouchersTableRowActions({
    fund,
    voucher,
    organization,
    fetchVouchers,
    shownVoucherMenuId,
    setShownVoucherMenuId,
}: {
    fund: Partial<Fund>;
    voucher: Voucher;
    organization: Organization;
    fetchVouchers: () => void;
    shownVoucherMenuId?: number;
    setShownVoucherMenuId?: React.Dispatch<React.SetStateAction<number>>;
}) {
    const showQrCode = useShowVoucherQrCode();

    const onOpenAction = useCallback(
        (e: React.MouseEvent) => {
            e.preventDefault();
            setShownVoucherMenuId(null);
            showQrCode(organization, voucher, fund, fetchVouchers);
        },
        [fetchVouchers, fund, organization, setShownVoucherMenuId, showQrCode, voucher],
    );

    return (
        <div className={`actions ${shownVoucherMenuId == voucher.id ? 'active' : ''}`}>
            <TableRowActions id={voucher.id} activeId={shownVoucherMenuId} setActiveId={setShownVoucherMenuId}>
                <div className="dropdown dropdown-actions">
                    <StateNavLink
                        className="dropdown-item"
                        name={'vouchers-show'}
                        params={{ organizationId: organization.id, id: voucher.id }}>
                        <em className={'mdi mdi-eye icon-start'} />
                        Bekijken
                    </StateNavLink>

                    {hasPermission(organization, 'manage_vouchers') &&
                        !voucher.is_granted &&
                        !voucher.expired &&
                        voucher.state != 'deactivated' && (
                            <Fragment>
                                <a
                                    className={`dropdown-item ${voucher.state === 'active' ? 'disabled' : ''}`}
                                    onClick={onOpenAction}>
                                    <em className="mdi mdi-bookmark icon-start" />
                                    Activeren
                                </a>

                                <a
                                    className={`dropdown-item ${voucher.state === 'pending' ? 'disabled' : ''}`}
                                    onClick={onOpenAction}>
                                    <em className="mdi mdi-qrcode icon-start" />
                                    QR-code
                                </a>
                            </Fragment>
                        )}
                </div>
            </TableRowActions>
        </div>
    );
}
