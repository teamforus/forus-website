import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ModalState } from '../../modules/modals/context/ModalContext';
import useSetProgress from '../../hooks/useSetProgress';
import Fund from '../../props/models/Fund';
import { useFileService } from '../../services/FileService';
import useVoucherService from '../../services/VoucherService';
import { fileSize } from '../../helpers/string';
import Papa from 'papaparse';
import { chunk, groupBy, isEmpty, sortBy, uniq, map, countBy } from 'lodash';
import Organization from '../../props/models/Organization';
import usePushSuccess from '../../hooks/usePushSuccess';
import usePushDanger from '../../hooks/usePushDanger';
import { ResponseError } from '../../props/ApiResponses';
import { dateFormat } from '../../helpers/dates';
import useAuthIdentity from '../../hooks/useAuthIdentity';
import { useHelperService } from '../../services/HelperService';
import Voucher from '../../props/models/Voucher';
import Product from '../../props/models/Product';
import useProductService from '../../services/ProductService';
import ModalDuplicatesPicker from './ModalDuplicatesPicker';
import useOpenModal from '../../hooks/useOpenModal';
import CSVProgressBar from '../elements/csv-progress-bar/CSVProgressBar';
import useTranslate from '../../hooks/useTranslate';

type CSVErrorProp = {
    csvHasBsnWhileNotAllowed?: boolean;
    csvAmountMissing?: boolean;
    csvProductIdPresent?: boolean;
    invalidAmountField?: boolean;
    invalidPerVoucherAmount?: boolean;
    csvHasMissingProductId?: boolean;
    csvProductsInvalidStockIds?: Array<number>;
    csvProductsInvalidUnknownIds?: Array<number>;
    csvProductsInvalidStockIdsList?: string;
    csvProductsInvalidUnknownIdsList?: string;
    hasAmountField?: boolean;
    hasInvalidFundIds?: boolean;
    hasInvalidFundIdsList?: string;
};

type RowDataProp = {
    amount?: number;
    expires_at?: string;
    note?: string;
    email?: string;
    activate?: number;
    activation_code?: string;
    client_uid?: string;
    product_id?: number;
};

export default function ModalVouchersUpload({
    modal,
    className,
    funds,
    fund,
    organization,
    onCompleted,
}: {
    modal: ModalState;
    className?: string;
    funds: Array<Partial<Fund>>;
    fund: Partial<Fund>;
    organization: Organization;
    onCompleted: () => void;
}) {
    const translate = useTranslate();
    const openModal = useOpenModal();
    const pushDanger = usePushDanger();
    const pushSuccess = usePushSuccess();
    const setProgress = useSetProgress();
    const authIdentity = useAuthIdentity();

    const fileService = useFileService();
    const helperService = useHelperService();
    const productService = useProductService();
    const voucherService = useVoucherService();

    const [type] = useState<string>('fund_voucher');
    const [data, setData] = useState(null);
    const abort = useRef<boolean>(false);
    const [csvFile, setCsvFile] = useState<File>(null);
    const [products, setProducts] = useState<Array<Product>>(null);
    const [hideModal, setHideModal] = useState(false);
    const [changed, setChanged] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [isDragOver, setIsDragOver] = useState(false);
    const [dataChunkSize] = useState<number>(100);
    const [productsIds, setProductsIds] = useState<number[]>([]);
    const [csvProgress, setCsvProgress] = useState<number>(0);
    const [csvIsValid, setCsvIsValid] = useState(false);
    const [csvErrors, setCsvErrors] = useState<CSVErrorProp>({});
    const [availableFundsIds] = useState(funds.map((fund) => fund.id));
    const [availableFundsById] = useState(funds.reduce((obj, fund) => ({ ...obj, [fund.id]: fund }), {}));
    const [progressBar, setProgressBar] = useState<number>(0);
    const [progressStatus, setProgressStatus] = useState<string>('');
    const [productsByIds, setProductsByIds] = useState<Array<Product>>(null);
    const [acceptedFiles] = useState(['.csv']);
    const inputRef = useRef<HTMLInputElement>(null);

    const onDragEvent = useCallback((e, isDragOver: boolean) => {
        e?.preventDefault();
        e?.stopPropagation();

        setIsDragOver(isDragOver);
    }, []);

    const closeModal = useCallback(() => {
        if (changed) {
            onCompleted();
        }
        modal.close();
    }, [changed, modal, onCompleted]);

    const downloadExampleCsv = useCallback(() => {
        if (type == 'fund_voucher') {
            fileService.downloadFile(
                'budget_voucher_upload_sample.csv',
                fund?.type === 'budget'
                    ? voucherService.sampleCSVBudgetVoucher(fund.end_date)
                    : voucherService.sampleCSVSubsidiesVoucher(fund.end_date),
            );
        } else {
            fileService.downloadFile(
                'product_voucher_upload_sample.csv',
                voucherService.sampleCSVProductVoucher(productsIds[0] || null, fund.end_date),
            );
        }
    }, [fileService, fund?.end_date, fund?.type, productsIds, type, voucherService]);

    const setLoadingBarProgress = useCallback((progress, status = null) => {
        setProgressBar(progress);
        setProgressStatus(status);
    }, []);

    const reset = useCallback(() => {
        abort.current = true;

        setCsvFile(null);
        setCsvErrors(null);
        setCsvIsValid(false);
        setCsvProgress(null);
    }, []);

    const getStatus = useCallback((fund: Fund, validation = false) => {
        return validation ? `Gegevens valideren voor ${fund.name}...` : `Gegevens uploaden voor ${fund.name}...`;
    }, []);

    const validateProductId = useCallback(
        (data = []) => {
            const allProductIds = countBy(data, 'product_id');

            const hasMissingProductId = data.filter((row: RowDataProp) => row.product_id === undefined).length > 0;
            const invalidProductIds = data.filter((row: RowDataProp) => !productsByIds[row.product_id]);
            const invalidStockIds = data
                .filter((row: RowDataProp) => productsByIds[row.product_id])
                .filter((row: RowDataProp) => {
                    return (
                        !productsByIds[row.product_id].unlimited_stock &&
                        productsByIds[row.product_id].stock_amount < allProductIds[row.product_id]
                    );
                });

            return {
                isValid: !invalidProductIds.length && !invalidStockIds.length,
                hasMissingProductId: hasMissingProductId,
                invalidStockIds: invalidStockIds,
                invalidProductIds: invalidProductIds,
            };
        },
        [productsByIds],
    );

    const validateCsvDataBudget = useCallback(
        (data) => {
            const fundBudget = parseFloat(fund.limit_sum_vouchers);
            const csvTotalAmount: number = data.reduce((sum: number, row: RowDataProp) => sum + (row.amount || 0), 0);

            if (fund.type === 'budget') {
                csvErrors.csvAmountMissing = data.filter((row: RowDataProp) => !row.amount).length > 0;

                // csv total amount should be withing fund budget
                csvErrors.invalidAmountField = csvTotalAmount > fundBudget;

                // some vouchers exceed the limit per voucher
                csvErrors.invalidPerVoucherAmount =
                    data.filter((row: RowDataProp) => row.amount > parseFloat(fund.limit_per_voucher)).length > 0;
            }

            // fund vouchers csv shouldn't have product_id field
            csvErrors.csvProductIdPresent = data.filter((row: RowDataProp) => row.product_id != undefined).length > 0;
            setCsvErrors({ ...csvErrors });

            return (
                !csvErrors.invalidAmountField &&
                !csvErrors.csvProductIdPresent &&
                !csvErrors.csvAmountMissing &&
                !csvErrors.invalidPerVoucherAmount
            );
        },
        [csvErrors, fund.limit_per_voucher, fund.limit_sum_vouchers, fund.type],
    );

    const validateCsvDataProduct = useCallback(
        (data) => {
            const validation = validateProductId(data);

            csvErrors.csvHasMissingProductId = validation.hasMissingProductId;
            csvErrors.csvProductsInvalidStockIds = validation.invalidStockIds;
            csvErrors.csvProductsInvalidUnknownIds = validation.invalidProductIds;

            csvErrors.csvProductsInvalidStockIdsList = uniq(
                map(csvErrors.csvProductsInvalidStockIds, 'product_id'),
            ).join(', ');

            csvErrors.csvProductsInvalidUnknownIdsList = uniq(
                map(csvErrors.csvProductsInvalidUnknownIds, 'product_id'),
            ).join(', ');

            // product vouchers .csv should not have an `amount` field
            csvErrors.hasAmountField = data.filter((row: RowDataProp) => row.amount != undefined).length > 0;

            setCsvErrors({ ...csvErrors });

            return !csvErrors.hasAmountField && !csvErrors.csvHasMissingProductId && validation.isValid;
        },
        [csvErrors, validateProductId],
    );

    const confirmEmailSkip = useCallback(
        (existingEmails, fund: Fund, list) => {
            const items = existingEmails.map((email: string) => ({ value: email, columns: { fund: fund.name } }));

            return new Promise((resolve, reject) => {
                if (items.length === 0) {
                    return resolve(list);
                }

                openModal((modal) => (
                    <ModalDuplicatesPicker
                        modal={modal}
                        hero_title={`Dubbele e-mailadressen gedetecteerd voor fond "${fund.name}".`}
                        hero_subtitle={[
                            `Weet u zeker dat u voor ${items.length} e-mailadres(sen) een extra voucher wilt aanmaken?`,
                            'Deze e-mailadressen bezitten al een voucher van dit fonds.',
                        ]}
                        button_none={'Alle overslaan'}
                        button_all={'Alle aanmaken'}
                        enableToggles={false}
                        label_on={'Aanmaken'}
                        label_off={'Overslaan'}
                        items={items}
                        onConfirm={() => (items: Array<{ value: string; blink?: boolean; model?: boolean }>) => {
                            const allowedEmails = items.filter((item) => item.model).map((item) => item.value);

                            console.log('onConfirm1: ');
                            resolve(
                                list.filter((row) => {
                                    return !existingEmails.includes(row.email) || allowedEmails.includes(row.email);
                                }),
                            );
                        }}
                        onCancel={() => reject(`CSV upload is geannuleerd voor ${fund.name}.`)}
                    />
                ));
            });
        },
        [openModal],
    );

    const confirmBsnSkip = useCallback(
        (existingBsn, fund: Fund, list) => {
            const items = existingBsn.map((bsn: string) => ({ value: bsn, columns: { fund: fund.name } }));

            return new Promise((resolve, reject) => {
                if (items.length === 0) {
                    return resolve(list);
                }

                openModal((modal) => (
                    <ModalDuplicatesPicker
                        modal={modal}
                        hero_title={`Dubbele bsn(s) gedetecteerd voor fond "${fund.name}".`}
                        hero_subtitle={[
                            `Weet u zeker dat u voor ${items.length} bsn(s) een extra voucher wilt aanmaken?`,
                            'Deze bsn(s) bezitten al een voucher van dit fonds.',
                        ]}
                        enableToggles={true}
                        button_none={'Alle overslaan'}
                        button_all={'Alle aanmaken'}
                        label_on={'Aanmaken'}
                        label_off={'Overslaan'}
                        items={items}
                        onConfirm={() => (items) => {
                            const allowedBsn = items.filter((item) => item.model).map((item) => item.value);

                            console.log('onConfirm2: ');
                            resolve(
                                list.filter((row) => {
                                    return !allowedBsn.includes(row.bsn) || allowedBsn.includes(row.bsn);
                                }),
                            );
                        }}
                        onCancel={() => reject(`CSV upload is geannuleerd voor ${fund.name}.`)}
                    />
                ));
            });
        },
        [openModal],
    );

    const findDuplicates = useCallback(
        (fund, list) => {
            pushSuccess(
                'Wordt verwerkt...',
                `Bestaande tegoeden voor "${fund.name}" worden verwerkt om te controleren op dubbelingen.`,
                {
                    icon: 'download-outline',
                },
            );

            return new Promise((resolve, reject) => {
                const fetchVouchers = (page: number) => {
                    return voucherService.index(organization.id, {
                        fund_id: fund.id,
                        type: type,
                        per_page: 100,
                        page: page,
                        source: 'employee',
                        expired: 0,
                    });
                };

                setProgress(0);

                helperService
                    .recursiveLeach(fetchVouchers, 4)
                    .then(async (data: Array<Voucher>) => {
                        setProgress(100);

                        pushSuccess(
                            'Aan het vergelijken...',
                            `De tegoeden voor "${fund.name}" zijn ingeladen en worden vergeleken met het .csv bestand...`,
                            { icon: 'timer-sand' },
                        );

                        const emails = data.map((voucher) => voucher.identity_email);
                        const bsnList = [
                            ...data.map((voucher) => voucher.relation_bsn),
                            ...data.map((voucher) => voucher.identity_bsn),
                        ];

                        const existingEmails = list
                            .filter((csvRow: { email: string }) => emails.includes(csvRow.email))
                            .map((csvRow: { email: string }) => csvRow.email);

                        const existingBsn = list
                            .filter((csvRow: { bsn: string }) => bsnList.includes(csvRow.bsn))
                            .map((csvRow: { bsn: string }) => csvRow.bsn);

                        if (existingEmails.length === 0 && existingBsn.length === 0) {
                            return resolve(list);
                        }

                        return Promise.all([
                            confirmEmailSkip(existingEmails, fund, list),
                            confirmBsnSkip(existingBsn, fund, list),
                        ])
                            .then(() => {
                                return resolve(list);
                            })
                            .catch((error) => {
                                console.error(error.message);
                            });
                    })
                    .catch(() => {
                        pushDanger('Error', 'Er is iets misgegaan bij het ophalen van de tegoeden.');
                        reject();
                        closeModal();
                    });
            });
        },
        [
            closeModal,
            confirmBsnSkip,
            confirmEmailSkip,
            helperService,
            organization.id,
            pushDanger,
            pushSuccess,
            setProgress,
            type,
            voucherService,
        ],
    );

    const validateCsvData = useCallback(
        (data) => {
            const invalidFundIds = data
                .filter((row) => {
                    const validFormat = row.fund_id && /^\d+$/.test(row.fund_id);
                    const validFund = availableFundsIds.includes(parseInt(row.fund_id));

                    return !validFormat || !validFund;
                })
                .map((row) => row.fund_id);

            setCsvErrors({
                ...csvErrors,
                hasInvalidFundIds: invalidFundIds.length > 0,
                hasInvalidFundIdsList: uniq(invalidFundIds).join(', '),
            });

            if (invalidFundIds.length > 0) {
                return false;
            }

            if (!organization.bsn_enabled && data.filter((row) => row.bsn).length > 0) {
                setCsvErrors({
                    ...csvErrors,
                    csvHasBsnWhileNotAllowed: true,
                });
                return false;
            }

            if (type == 'fund_voucher') {
                return validateCsvDataBudget(data);
            } else if (type == 'product_voucher') {
                return validateCsvDataProduct(data);
            }

            return false;
        },
        [availableFundsIds, csvErrors, organization.bsn_enabled, type, validateCsvDataBudget, validateCsvDataProduct],
    );

    const transformCsvData = useCallback((rawData) => {
        const header = rawData[0];

        const recordIndexes = header.reduce((list: Array<number>, row: string, index: number) => {
            return row.startsWith('record.') ? [...list, index] : list;
        }, []);

        const body = rawData
            .slice(1)
            .filter((row: Array<string>) => {
                return row.filter((col) => !isEmpty(col)).length > 0;
            })
            .map((row: Array<string>) => {
                const records = recordIndexes.reduce((list: Array<string>, index: number) => {
                    return { ...list, [header[index].slice('record.'.length)]: row[index] };
                }, {});

                const values = row.reduce((list, item, key) => {
                    return recordIndexes.includes(key) ? list : [...list, item];
                }, []);

                return [...values, records];
            });

        return [
            [...header.filter((value: string, index: number) => value && !recordIndexes.includes(index)), 'records'],
            ...body,
        ];
    }, []);

    const defaultNote = useCallback(
        (row) => {
            return translate('vouchers.csv.default_note' + (row.email ? '' : '_no_email'), {
                upload_date: dateFormat(new Date(), 'YYYY-MM-DD'),
                uploader_email: authIdentity?.email || authIdentity?.address,
                target_email: row.email || null,
            });
        },
        [authIdentity?.address, authIdentity?.email, translate],
    );

    const showInvalidRows = useCallback(
        (errors = {}, vouchers = []) => {
            const items = Object.keys(errors)
                .map(function (key) {
                    const keyData = key.split('.');
                    const keyDataId = keyData[1];
                    const index = parseInt(keyDataId, 10) + 1;

                    return [index, errors[key], vouchers[keyDataId]];
                })
                .sort((a, b) => a[0] - b[0]);

            const uniqueRows = items.reduce((arr, item) => {
                return arr.includes(item[0]) ? arr : [...arr, item[0]];
            }, []);

            const message = [
                `${uniqueRows.length} van ${vouchers.length}`,
                `rij(en) uit het bulkbestand zijn niet geimporteerd,`,
                `bekijk het bestand bij welke rij(en) het mis gaat.`,
            ].join(' ');

            pushDanger('Waarschuwing', message);

            setHideModal(true);

            openModal((modal) => (
                <ModalDuplicatesPicker
                    modal={modal}
                    hero_title={'Er zijn fouten opgetreden bij het importeren van de tegoeden'}
                    hero_subtitle={message}
                    enableToggles={false}
                    label_on={'Aanmaken'}
                    label_off={'Overslaan'}
                    items={items.map((item) => ({
                        value: `Rij: ${item[0]}: ${item[2]['email'] || item[2]['bsn'] || ''} - ${item[1]}`,
                    }))}
                    onConfirm={() => window.setTimeout(() => setHideModal(false), 300)}
                    onCancel={() => window.setTimeout(() => setHideModal(false), 300)}
                />
            ));
        },
        [openModal, pushDanger],
    );

    const uploadFile = useCallback(
        (file: File) => {
            if (!file.name.endsWith('.csv')) {
                return;
            }

            return new Promise((resolve) => Papa.parse(file, { complete: resolve })).then(
                (res: { data: Array<Array<string>>; errors: Array<string>; meta: object }) => {
                    const csvData = transformCsvData(res.data);
                    const body = csvData;
                    const header = csvData.shift();

                    const data = body
                        .filter((row: Array<string>) => {
                            return row.filter((col) => !isEmpty(col)).length > 0;
                        })
                        .map((val) => {
                            const row: {
                                note?: string;
                                fund_id?: number;
                                client_uid?: string;
                                activation_code_uid?: string;
                            } = {};

                            header.forEach((hVal: string, hKey: string) => {
                                if (val[hKey] && val[hKey] != '') {
                                    row[hVal.trim()] = typeof val[hKey] === 'object' ? val[hKey] : val[hKey].trim();
                                }
                            });

                            row.note = row.note || defaultNote(row);
                            row.fund_id = row.fund_id || fund.id;
                            row.client_uid = row.client_uid || row.activation_code_uid || null;
                            delete row.activation_code_uid;

                            return isEmpty(row) ? false : row;
                        })
                        .filter((row) => !!row);

                    setCsvIsValid(validateCsvData(data));
                    setData(data);
                    setCsvFile(file);
                    setCsvProgress(1);
                },
                console.error,
            );
        },
        [defaultNote, fund.id, transformCsvData, validateCsvData],
    );

    const startUploadingData = useCallback(
        (fund: Fund, groupData, onChunk: (data) => void) => {
            return new Promise((resolve) => {
                const submitData = chunk(groupData, dataChunkSize);
                const chunksCount = submitData.length;
                let currentChunkNth = 0;

                const uploadChunk = (data) => {
                    setChanged(true);

                    voucherService
                        .storeCollection(organization.id, fund.id, data)
                        .then(() => {
                            currentChunkNth++;
                            onChunk(data);

                            if (currentChunkNth == chunksCount) {
                                resolve(true);
                            } else if (currentChunkNth < chunksCount) {
                                uploadChunk(submitData[currentChunkNth]);
                            }
                        })
                        .catch((res: ResponseError) => {
                            if (res.status == 422 && res.data.errors) {
                                return pushDanger(
                                    'Het is niet gelukt om het gekozen bestand te verwerken.',
                                    Object.values(res.data.errors).reduce((msg, arr) => msg + arr.join(''), ''),
                                );
                            }

                            alert('Onbekende error.');
                        });
                };

                if (abort.current) {
                    return (abort.current = false);
                }

                uploadChunk(submitData[currentChunkNth]);
            });
        },
        [dataChunkSize, organization.id, pushDanger, voucherService],
    );

    const startValidationUploadingData = useCallback(
        (fund, groupData, onChunk = () => null) => {
            return new Promise((resolve, reject) => {
                const submitData = chunk(groupData, dataChunkSize);
                const chunksCount = submitData.length;
                const errors = {};

                let currentChunkNth = 0;

                const resolveIfFinished = () => {
                    if (currentChunkNth == chunksCount) {
                        if (Object.keys(errors).length) {
                            return reject(errors);
                        }

                        resolve(true);
                    } else if (currentChunkNth < chunksCount) {
                        uploadChunk(submitData[currentChunkNth]);
                    }
                };

                const uploadChunk = (data) => {
                    voucherService
                        .storeCollectionValidate(organization.id, fund.id, data)
                        .then(() => {
                            currentChunkNth++;
                            onChunk(data);
                            resolveIfFinished();
                        })
                        .catch((res: ResponseError) => {
                            if (res.status == 422 && res.data.errors) {
                                Object.keys(res.data.errors).forEach(function (key) {
                                    const keyData = key.split('.');
                                    keyData[1] = (
                                        parseInt(keyData[1], 10) +
                                        currentChunkNth * dataChunkSize
                                    ).toString();
                                    errors[keyData.join('.')] = res.data.errors[key];
                                });
                            } else {
                                alert('Onbekende error.');
                            }

                            currentChunkNth++;
                            onChunk(data);

                            resolveIfFinished();
                        });
                };

                uploadChunk(submitData[currentChunkNth]);
            });
        },
        [dataChunkSize, organization.id, voucherService],
    );

    const startUploading = useCallback(
        (data, validation = false) => {
            setCsvProgress(2);

            return new Promise((resolve) => {
                const dataGrouped = groupBy(
                    JSON.parse(JSON.stringify(data)).map((row) => ({
                        ...row,
                        fund_id: row.fund_id ? row.fund_id : fund.id,
                    })),
                    'fund_id',
                );

                const promise = Object.keys(dataGrouped).reduce((chain, fundId) => {
                    const fund = availableFundsById[fundId];
                    const items = dataGrouped[fund.id].map((item) => {
                        delete item.fund_id;
                        return item;
                    });

                    const totalRows = items.length;
                    let uploadedRows = 0;

                    setLoadingBarProgress(0, getStatus(fund, validation));

                    return chain.then(() => {
                        if (validation) {
                            return startValidationUploadingData(fund, items, (chunkData) => {
                                uploadedRows += chunkData.length;
                                setLoadingBarProgress((uploadedRows / totalRows) * 100, getStatus(fund, true));
                            })
                                .then(() => {
                                    setLoadingBarProgress(100, getStatus(fund, true));
                                })
                                .catch((errors: ResponseError) => {
                                    setCsvProgress(1);
                                    showInvalidRows(errors, items);
                                });
                        }

                        return startUploadingData(fund, items, (chunkData) => {
                            uploadedRows += chunkData.length;
                            setLoadingBarProgress((uploadedRows / totalRows) * 100, getStatus(fund, false));

                            if (uploadedRows === totalRows) {
                                window.setTimeout(() => {
                                    setLoadingBarProgress(100, getStatus(fund, false));
                                    setCsvProgress(3);
                                }, 0);
                            }
                        });
                    });
                }, Promise.resolve());

                promise.then(() => {
                    resolve(null);
                });
            });
        },
        [
            availableFundsById,
            fund.id,
            getStatus,
            setLoadingBarProgress,
            showInvalidRows,
            startUploadingData,
            startValidationUploadingData,
        ],
    );

    const uploadToServer = useCallback(() => {
        if (!csvIsValid) {
            return false;
        }

        setLoading(true);

        const listByFundId = groupBy(data, 'fund_id');
        const listSelected = [];

        const list = Object.keys(listByFundId).map((fund_id) => ({
            list: listByFundId[fund_id],
            fund: availableFundsById[fund_id],
        }));

        const promise = list.reduce((promiseChain, { fund, list }) => {
            setHideModal(true);

            return promiseChain.then(() =>
                findDuplicates(fund, list).then((list: Array<string>) => listSelected.push(...list)),
            );
        }, Promise.resolve());

        promise
            .then(async () => {
                setHideModal(false);

                if (listSelected.length > 0) {
                    return await startUploading(listSelected, true).then(() => {
                        return startUploading(listSelected);
                    });
                }

                pushSuccess('CSV upload is geannuleerd', 'Er zijn geen gegevens geselecteerd.');
            })
            .catch(() => {
                pushDanger('CSV upload is geannuleerd', 'Er zijn geen gegevens geselecteerd.');
            })
            .finally(() => {
                setLoadingBarProgress(0);
                setHideModal(false);
                setLoading(false);
            });
    }, [
        availableFundsById,
        csvIsValid,
        data,
        findDuplicates,
        pushDanger,
        pushSuccess,
        setLoadingBarProgress,
        startUploading,
    ]);

    const fetchProducts = useCallback(() => {
        if (type == 'product_voucher') {
            helperService
                .recursiveLeach((page: number) => {
                    return productService.listAll({
                        fund_id: fund.id,
                        page: page,
                        per_page: 1000,
                    });
                }, 4)
                .then((data: Array<Product>) => {
                    setProducts(sortBy(data, 'id'));
                    setProductsIds(products.map((product) => product.id));
                    setProductsByIds(
                        products.reduce((obj: Array<Product>, product) => {
                            obj[product.id] = product;
                            return obj;
                        }, []),
                    );
                });
        }
    }, [fund.id, helperService, productService, products, type]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    return (
        <div
            className={`modal modal-animated ${modal.loading || hideModal ? 'modal-loading' : ''} ${
                isDragOver ? 'is-dragover' : ''
            } ${className}`}
            data-dusk="modalVoucherUpload">
            <div className="modal-backdrop" onClick={closeModal} />
            <div className="modal-window">
                <a className="mdi mdi-close modal-close" onClick={closeModal} role="button" />
                <div className="modal-header">Upload CSV-bestand</div>
                <div className="modal-body form">
                    <div className="modal-section form">
                        {fund && (
                            <div
                                className="block block-csv condensed"
                                onDragOver={(e) => onDragEvent(e, true)}
                                onDragEnter={(e) => onDragEvent(e, true)}
                                onDragLeave={(e) => onDragEvent(e, false)}
                                onDragEnd={(e) => onDragEvent(e, false)}
                                onDrop={(e) => {
                                    onDragEvent(e, false);
                                    uploadFile(e.dataTransfer.files[0]).then();
                                }}>
                                <div className="csv-inner">
                                    <input
                                        hidden={true}
                                        ref={inputRef}
                                        type="file"
                                        accept={(acceptedFiles || []).join(',')}
                                        onChange={(e) => {
                                            uploadFile(e.target.files?.[0]).then();
                                            e.target.value = null;
                                        }}
                                    />

                                    {csvProgress <= 1 && (
                                        <div className="csv-upload-btn" onClick={() => inputRef.current.click()}>
                                            <div className="csv-upload-icon">
                                                <div className="mdi mdi-upload" />
                                            </div>
                                            <div className="csv-upload-text">
                                                {translate('csv_upload.labels.upload')}
                                                <br />
                                                <span>{translate('csv_upload.labels.swipe')}</span>
                                            </div>
                                        </div>
                                    )}
                                    <div className="button-group flex-center">
                                        {csvProgress <= 1 && (
                                            <button
                                                className="button button-default"
                                                onClick={() => downloadExampleCsv()}>
                                                <em className="mdi mdi-file-table-outline icon-start"> </em>
                                                <span>{translate('product_vouchers.buttons.download_csv')}</span>
                                            </button>
                                        )}
                                        {csvProgress <= 1 && (
                                            <button
                                                className="button button-primary"
                                                onClick={() => {
                                                    inputRef.current.click();
                                                }}
                                                data-dusk="selectFileButton">
                                                <em className="mdi mdi-upload icon-start"> </em>
                                                <span>{translate('vouchers.buttons.upload_csv')}</span>
                                            </button>
                                        )}
                                    </div>
                                    {csvProgress >= 2 && (
                                        <div className={`csv-upload-progress ${csvProgress == 3 ? 'done' : ''}`}>
                                            <div className="csv-upload-icon">
                                                {csvProgress == 2 && <div className="mdi mdi-loading" />}
                                                {csvProgress == 3 && (
                                                    <div className="mdi mdi-check" data-dusk="successUploadIcon" />
                                                )}
                                            </div>
                                            <CSVProgressBar progressBar={progressBar} status={progressStatus} />
                                        </div>
                                    )}
                                    <div className="csv-upload-actions">
                                        {csvFile && csvProgress < 2 && (
                                            <div className="csv-file">
                                                <div className={`block block-file ${csvIsValid ? '' : 'has-error'}`}>
                                                    <div className="file-error mdi mdi-close-circle" />
                                                    <div className="file-name">{csvFile.name}</div>
                                                    <div className="file-size">{fileSize(csvFile.size)}</div>
                                                    <div
                                                        className="file-remove mdi mdi-close"
                                                        onClick={() => reset()}
                                                    />
                                                </div>

                                                {!csvIsValid && type == 'fund_voucher' && (
                                                    <div className="text-left">
                                                        {csvErrors.csvHasBsnWhileNotAllowed && (
                                                            <div className="form-error">
                                                                BSN field is present while BSN is not enabled for the
                                                                organization
                                                            </div>
                                                        )}
                                                        {csvErrors.csvAmountMissing && (
                                                            <div className="form-error">
                                                                De kolom `amount` &amp mist in het bulkbestand.
                                                            </div>
                                                        )}
                                                        {csvErrors.csvProductIdPresent && (
                                                            <div className="form-error">
                                                                De kolom `product_id` mag niet in het bestand zitten.
                                                            </div>
                                                        )}
                                                        {csvErrors.invalidAmountField && (
                                                            <div className="form-error">
                                                                Het totaal aantal budget van het gewenste aantal
                                                                tegoeden overschrijd het gestorte bedrag op het fonds.
                                                            </div>
                                                        )}
                                                        {csvErrors.invalidPerVoucherAmount && (
                                                            <div className="form-error">
                                                                Één of meer tegoeden gaan over het maximale bedrag per
                                                                tegoed. (limiet is: {fund.limit_per_voucher_locale}).
                                                            </div>
                                                        )}
                                                        {csvErrors.hasInvalidFundIds && (
                                                            <div className="form-error">
                                                                De kolom `fund_id` in het bulkbestand bevat verkeerde
                                                                fonds identificatienummers
                                                                {csvErrors.hasInvalidFundIdsList}. Deze nummers horen
                                                                niet bij de door u geselecteerde organisatie.
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {!csvIsValid && type == 'product_voucher' && (
                                                    <div className="text-left">
                                                        {csvErrors.csvHasBsnWhileNotAllowed && (
                                                            <div className="form-error">
                                                                BSN field is present while BSN is not enabled for the
                                                                organization
                                                            </div>
                                                        )}
                                                        {csvErrors.csvHasMissingProductId && (
                                                            <div className="form-error">
                                                                De kolom `product_id` mist in het bestand.
                                                            </div>
                                                        )}
                                                        {csvErrors.hasAmountField && (
                                                            <div className="form-error">
                                                                De kolom `amount` mag niet in het bestand zitten.
                                                            </div>
                                                        )}
                                                        {csvErrors.csvProductsInvalidUnknownIds.length > 0 && (
                                                            <div className="form-error">
                                                                De kolom `product_id` in het bulkbestand bevat verkeerde
                                                                product identificatienummers
                                                                {csvErrors.csvProductsInvalidUnknownIdsList}. De nummers
                                                                van deze producten zijn incorrect of de producten zijn
                                                                uitverkocht.
                                                            </div>
                                                        )}
                                                        {csvErrors.csvProductsInvalidStockIds.length > 0 && (
                                                            <div className="form-error">
                                                                De kolom `product_id` in het bulkbestand bevat
                                                                identificatienummers
                                                                {csvErrors.csvProductsInvalidStockIdsList}. van aanbod
                                                                aanbod dat uitverkocht is.
                                                            </div>
                                                        )}
                                                        {csvErrors.hasInvalidFundIds && (
                                                            <div className="form-error">
                                                                De kolom `fund_id` in het bulkbestand bevat verkeerde
                                                                fonds identificatienummers
                                                                {csvErrors.hasInvalidFundIdsList}. Deze nummers horen
                                                                niet bij de door u geselecteerde organisatie.
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {csvProgress == 1 && csvIsValid && (
                                            <div className="text-center">
                                                {!loading && (
                                                    <button
                                                        className="button button-primary"
                                                        onClick={() => uploadToServer()}
                                                        data-dusk="uploadFileButton">
                                                        {translate('csv_upload.buttons.upload')}
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <div className="modal-footer text-center">
                    <button
                        className="button button-primary"
                        onClick={closeModal}
                        id="close"
                        data-dusk="closeModalButton">
                        {translate('modal_funds_add.buttons.close')}
                    </button>
                </div>
            </div>
        </div>
    );
}
