import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Voucher from '../../../../props/models/Voucher';
import Organization from '../../../../props/models/Organization';
import useOpenModal from '../../../../hooks/useOpenModal';
import Paginator from '../../../../modules/paginator/components/Paginator';
import ModalVoucherRecordEdit from '../../../modals/ModalVoucherRecordEdit';
import useVoucherRecordService from '../../../../services/VoucherRecordService';
import { PaginationData } from '../../../../props/ApiResponses';
import VoucherRecord from '../../../../props/models/VoucherRecord';
import LoadingCard from '../../../elements/loading-card/LoadingCard';
import useFilter from '../../../../hooks/useFilter';
import usePaginatorService from '../../../../modules/paginator/services/usePaginatorService';
import ThSortable from '../../../elements/tables/ThSortable';
import ModalDangerZone from '../../../modals/ModalDangerZone';
import usePushSuccess from '../../../../hooks/usePushSuccess';

export default function VoucherRecords({ voucher, organization }: { voucher: Voucher; organization: Organization }) {
    const { t } = useTranslation();

    const openModal = useOpenModal();
    const pushSuccess = usePushSuccess();

    const paginatorService = usePaginatorService();
    const voucherRecordService = useVoucherRecordService();

    const [paginatorKey] = useState('voucher-records');
    const [records, setRecords] = useState<PaginationData<VoucherRecord>>(null);

    const filter = useFilter({
        q: '',
        order_by: 'created_at',
        order_dir: 'asc',
        per_page: paginatorService.getPerPage(paginatorKey, 10),
    });

    const fetchRecords = useCallback(() => {
        voucherRecordService.list(organization.id, voucher.id, filter.activeValues).then((res) => {
            setRecords(res.data);
        });
    }, [filter.activeValues, organization.id, voucher.id, voucherRecordService]);

    const editRecord = useCallback(
        (record = null) => {
            openModal((modal) => (
                <ModalVoucherRecordEdit
                    modal={modal}
                    voucher={voucher}
                    record={record}
                    organization={organization}
                    onClose={() => (record: VoucherRecord) => record ? fetchRecords() : null}
                />
            ));
        },
        [fetchRecords, openModal, organization, voucher],
    );

    const deleteRecord = useCallback(
        (record = null) => {
            openModal((modal) => (
                <ModalDangerZone
                    modal={modal}
                    title={t('modals.danger_zone.remove_voucher_record.title')}
                    description={t('modals.danger_zone.remove_voucher_record.title')}
                    buttonCancel={{
                        onClick: modal.close,
                        text: t('modals.danger_zone.remove_voucher_record.buttons.cancel'),
                    }}
                    buttonSubmit={{
                        onClick: () => {
                            voucherRecordService.destroy(organization.id, voucher.id, record.id).then(() => {
                                fetchRecords();
                                pushSuccess('Verwijderd!', 'Eigenschap is verwijderd!');
                            });
                        },
                        text: t('modals.danger_zone.remove_voucher_record.buttons.confirm'),
                    }}
                />
            ));
        },
        [fetchRecords, openModal, organization.id, pushSuccess, t, voucher.id, voucherRecordService],
    );

    useEffect(() => {
        fetchRecords();
    }, [fetchRecords]);

    if (!records) {
        return <LoadingCard />;
    }

    return (
        <div className="card">
            <div className="card-header">
                <div className="flex">
                    <div className="flex flex-grow">
                        <div className="card-title">
                            {t('voucher_records.header.title') + (records.meta ? ' (' + records.meta.total + ')' : '')}
                        </div>
                    </div>
                    <div className="flex">
                        <div className="block block-inline-filters">
                            <div className="form">
                                <div className="form-group">
                                    <input
                                        className="form-control"
                                        type="search"
                                        value={filter.activeValues.q}
                                        placeholder={t('voucher_records.labels.search')}
                                        onChange={(e) => filter.update({ q: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="button button-primary button-sm" onClick={() => editRecord()}>
                                <div className="mdi mdi-plus-circle icon-start" />
                                {t('voucher_records.buttons.add_record')}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {records.data.length > 0 && (
                <div className="card-section">
                    <div className="card-block card-block-table">
                        <div className="table-wrapper">
                            <table className="table">
                                <tbody>
                                    <tr className="nowrap">
                                        <ThSortable
                                            className="th-narrow"
                                            filter={filter}
                                            label={t('voucher_records.labels.id')}
                                            value="id"
                                        />
                                        <ThSortable
                                            filter={filter}
                                            label={t('voucher_records.labels.record_type')}
                                            value="record_type_name"
                                        />
                                        <ThSortable
                                            className="th-narrow"
                                            filter={filter}
                                            label={t('voucher_records.labels.value')}
                                            value="value"
                                        />
                                        <ThSortable
                                            filter={filter}
                                            label={t('voucher_records.labels.created_at')}
                                            value="created_at"
                                        />
                                        <ThSortable
                                            filter={filter}
                                            label={t('voucher_records.labels.note')}
                                            value="note"
                                        />
                                        <ThSortable
                                            className="th-narrow text-right"
                                            filter={filter}
                                            label={t('voucher_records.labels.action')}
                                            value="note"
                                        />
                                    </tr>

                                    {records.data.map((record, index: number) => (
                                        <tr key={index}>
                                            <td className="td-narrow nowrap">{record.id}</td>
                                            <td className="nowrap">{record.record_type.name}</td>
                                            <td>{record.value_locale}</td>
                                            <td className="nowrap">{record.created_at_locale}</td>
                                            <td className={record.note ? '' : 'text-muted'}>
                                                {record.note || 'No note'}
                                            </td>
                                            <td>
                                                <div className="button-group">
                                                    <div
                                                        className="button button-sm button-icon button-default"
                                                        onClick={() => editRecord(record)}>
                                                        <div className="mdi mdi-pencil-outline icon-start" />
                                                    </div>
                                                    <div
                                                        className="button button-sm button-icon button-danger"
                                                        onClick={() => deleteRecord(record)}>
                                                        <div className="mdi mdi-delete-outline icon-start" />
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
            {records.meta && records.meta.last_page > 1 && (
                <div className="card-section">
                    <Paginator
                        meta={records.meta}
                        filters={filter.values}
                        updateFilters={filter.update}
                        perPageKey={paginatorKey}
                    />
                </div>
            )}
            {records.meta.total == 0 && (
                <div className="card-section">
                    <div className="block block-empty text-center">
                        <div className="empty-title">Geen eigenschappen gevonden</div>
                    </div>
                </div>
            )}
        </div>
    );
}
