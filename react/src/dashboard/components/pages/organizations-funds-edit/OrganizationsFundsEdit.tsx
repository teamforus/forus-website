import React, { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFundService } from '../../../services/FundService';
import useSetProgress from '../../../hooks/useSetProgress';
import Fund from '../../../props/models/Fund';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import { useNavigate, useParams } from 'react-router-dom';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import useFormBuilder from '../../../hooks/useFormBuilder';
import { PaginationData, ResponseError, ResponseErrorData } from '../../../props/ApiResponses';
import usePushSuccess from '../../../hooks/usePushSuccess';
import PhotoSelector from '../../elements/photo-selector/PhotoSelector';
import { useMediaService } from '../../../services/MediaService';
import FormError from '../../elements/forms/errors/FormError';
import CheckboxControl from '../../elements/forms/controls/CheckboxControl';
import Tooltip from '../../elements/tooltip/Tooltip';
import SelectControl from '../../elements/select-control/SelectControl';
import { hasPermission } from '../../../helpers/utils';
import SelectControlOptions from '../../elements/select-control/templates/SelectControlOptions';
import useAssetUrl from '../../../hooks/useAssetUrl';
import useTagService from '../../../services/TagService';
import Tag from '../../../props/models/Tag';
import MarkdownEditor from '../../elements/forms/markdown-editor/MarkdownEditor';
import FaqEditor from './elements/FaqEditor';
import Faq from '../../../props/models/Faq';
import DatePickerControl from '../../elements/forms/controls/DatePickerControl';
import { addDays, addYears } from 'date-fns';
import { dateFormat, dateParse } from '../../../helpers/dates';
import useAppConfigs from '../../../hooks/useAppConfigs';
import FundFormulaProduct from '../../../props/models/FundFormulaProduct';
import Product from '../../../props/models/Product';
import useProductService from '../../../services/ProductService';
import { sortBy } from 'lodash';
import RecordType from '../../../props/models/RecordType';
import useRecordTypeService from '../../../services/RecordTypeService';
import { useEmployeeService } from '../../../services/EmployeeService';
import FundCriterion from '../../../props/models/FundCriterion';
import FundCriteriaEditor from '../organizations-funds-show/elements/FundCriteriaEditor';
import Organization from '../../../props/models/Organization';
import { useOrganizationService } from '../../../services/OrganizationService';
import FundConfigContactInfoEditor from './elements/FundConfigContactInfoEditor';
import { getStateRouteUrl, useNavigateState } from '../../../modules/state_router/Router';
import MultiSelectControl from '../../elements/forms/controls/MultiSelectControl';
import LoadingCard from '../../elements/loading-card/LoadingCard';
import usePushDanger from '../../../hooks/usePushDanger';

type Validator = {
    id: number;
    email: string;
};

type FormDataProp = {
    name?: string;
    state?: string;
    description_short?: string;
    external_page?: boolean;
    hide_meta?: boolean;
    media_uid?: string;
    type?: string;
    fund_type?: string;
    external_page_url?: string;
    request_btn_text?: string;
    application_method?: string;
    external_link_text?: string;
    external_link_url?: string;
    description_html?: string;
    description?: string;
    faq_title?: string;
    descriptionPosition?: string;
    start_date?: string;
    end_date?: string;
    formula_products?: Array<FundFormulaProduct>;
    product_id?: number;
    default_validator_employee_id?: number;
    auto_requests_validation?: boolean;
    criteria?: Array<FundCriterion>;
    notification_amount?: number;
    tag_ids?: Array<number>;
    email_required?: boolean;
    contact_info_enabled?: boolean;
    contact_info_required?: boolean;
    contact_info_message_custom?: boolean;
    contact_info_message_text?: string;
};

export default function OrganizationsFundsEdit() {
    const { t } = useTranslation();

    const assetUrl = useAssetUrl();
    const setProgress = useSetProgress();
    const pushSuccess = usePushSuccess();
    const pushDanger = usePushDanger();
    const navigateState = useNavigateState();
    const appConfigs = useAppConfigs();
    const navigate = useNavigate();
    const activeOrganization = useActiveOrganization();

    const tagService = useTagService();
    const fundService = useFundService();
    const mediaService = useMediaService();
    const productService = useProductService();
    const employeeService = useEmployeeService();
    const recordTypeService = useRecordTypeService();
    const organizationService = useOrganizationService();

    const [fundPhoto, setFundPhoto] = useState(null);
    const [fund, setFund] = useState<Fund>(null);
    const [faq, setFaq] = useState<Array<Faq>>([]);
    const [tags, setTags] = useState<Array<Tag>>(null);
    const [validators, setValidators] = useState<Array<Validator>>(null);
    const [showInfoBlock, setShowInfoBlock] = useState<boolean>(false);
    const [recordTypes, setRecordTypes] = useState<Array<Partial<RecordType>>>([]);
    const [products, setProducts] = useState<Array<Partial<Product>>>(null);
    const [recordTypesMultiplier, setRecordTypesMultiplier] = useState<Array<unknown>>([]);
    const [productOptions, setProductOptions] = useState<Array<Array<Partial<Product>>>>([]);
    const [validatorOrganizations, setValidatorOrganizations] = useState<PaginationData<Organization>>(null);
    const faqEditorBlock = useRef<() => Promise<boolean>>();
    const criteriaBlockRef = useRef<() => Promise<unknown>>();

    const [fundTypes] = useState([
        { key: 'budget', name: 'Waardebon' },
        { key: 'subsidies', name: 'Kortingspas' },
        { key: 'external', name: 'Informatief (met doorlink)' },
    ]);

    const [externalFundPageTypes] = useState([
        { value: false, name: 'Interne pagina' },
        { value: true, name: 'Externe pagina' },
    ]);

    const [descriptionPositions] = useState([
        { value: 'replace', name: 'Standaard content overschrijven' },
        { value: 'before', name: 'Voor de standaard content tonen' },
        { value: 'after', name: 'Na de standaard content tonen' },
    ]);

    const [applicationMethods] = useState([
        {
            key: 'application_form',
            name: 'Aanvraagformulier',
            default_button_text: 'Aanvragen',
            configs: { allow_fund_requests: 1, allow_prevalidations: 0, allow_direct_requests: 1 },
        },
        {
            key: 'activation_codes',
            name: 'Activatiecodes',
            default_button_text: 'Activeren',
            configs: { allow_fund_requests: 0, allow_prevalidations: 1, allow_direct_requests: 1 },
        },
        {
            key: 'all',
            name: 'Aanvraagformulier en activatiecodes',
            default_button_text: 'Aanvragen',
            configs: { allow_fund_requests: 1, allow_prevalidations: 1, allow_direct_requests: 1 },
        },
        {
            key: 'none',
            name: 'Geen aanvraagformulier en activatiecodes',
            default_button_text: 'Aanvragen',
            configs: { allow_fund_requests: 0, allow_prevalidations: 0, allow_direct_requests: 0 },
        },
    ]);

    const fund_id = parseInt(useParams().fundId);

    const form = useFormBuilder<FormDataProp>(
        {
            descriptionPosition: descriptionPositions[0]?.value,
            start_date: dateFormat(addDays(new Date(), 1)),
            end_date: dateFormat(addYears(new Date(), 1)),
            formula_products: [],
            default_validator_employee_id: null,
            application_method: 'application_form',

            // contact information
            email_required: true,
            contact_info_enabled: true,
            contact_info_required: true,
            contact_info_message_custom: false,
            contact_info_message_text: '',
        },
        async (values) => {
            const data = JSON.parse(JSON.stringify(values));

            const resolveErrors = (res: ResponseError) => {
                form.setIsLocked(false);
                form.setErrors(res.data.errors);
            };

            if (appConfigs.organizations.funds.criteria && !form.values.external_page) {
                try {
                    await criteriaBlockRef.current();
                } catch (e) {
                    return form.setIsLocked(false);
                }
            }

            try {
                await faqEditorBlock.current();
            } catch (e) {
                pushDanger('Error!', typeof e == 'string' ? e : e.message || '');
                return form.setIsLocked(false);
            }

            if (fundPhoto) {
                await mediaService.store('organization_logo', fundPhoto).then((res) => {
                    form.update({ media_uid: res.data.data.uid });
                    Object.assign(data, { media_uid: res.data.data.uid });
                    setFundPhoto(null);
                });
            }

            if (fund_id) {
                return fundService
                    .update(activeOrganization.id, fund_id, { ...data, faq: faq })
                    .then(() => {
                        navigate(
                            getStateRouteUrl('funds-show', { organizationId: activeOrganization.id, fundId: fund_id }),
                        );
                        pushSuccess('Gelukt!', 'Het fonds is aangepast!');
                    })
                    .catch((res: ResponseError) => resolveErrors(res))
                    .finally(() => form.setIsLocked(false));
            } else {
                return fundService
                    .store(activeOrganization.id, { ...data, faq: faq })
                    .then(() => {
                        navigate(getStateRouteUrl('organization-funds', { organizationId: activeOrganization.id }));
                        pushSuccess('Gelukt!', 'Het fonds is aangemaakt!');
                    })
                    .catch((res: ResponseError) => resolveErrors(res))
                    .finally(() => form.setIsLocked(false));
            }
        },
    );

    const { update: updateForm } = form;

    const cancel = useCallback(() => {
        return navigateState('organization-funds', { organizationId: activeOrganization.id });
    }, [activeOrganization.id, navigateState]);

    const fetchFund = useCallback(
        (fund_id: number) => {
            setProgress(0);

            fundService
                .read(activeOrganization.id, fund_id)
                .then((res) => {
                    setFund(res.data.data);
                })
                .finally(() => setProgress(100));
        },
        [activeOrganization.id, fundService, setProgress],
    );

    const fetchValidators = useCallback(() => {
        employeeService.list(activeOrganization.id, { role: 'validation' }).then((res) => {
            setValidators([
                { id: null, email: 'Geen' },
                ...res.data.data.map((employee) => ({ id: employee.id, email: employee.email })),
            ]);
        });
    }, [activeOrganization.id, employeeService]);

    const fetchValidatorOrganizations = useCallback(() => {
        organizationService.readListValidators(activeOrganization.id, { per_page: 100 }).then((res) => {
            setValidatorOrganizations(res.data);
        });
    }, [activeOrganization.id, organizationService]);

    const fetchProducts = useCallback(() => {
        setProgress(0);

        productService
            .listAll({ per_page: 1000, simplified: 1, unlimited_stock: 1 })
            .then((res) => {
                setProducts(
                    res.data.data.map((product) => ({
                        id: product.id,
                        price: product.price,
                        name: `${product.name} - €${product.price} (${product.organization.name})`,
                    })),
                );
            })
            .finally(() => setProgress(100));
    }, [productService, setProgress]);

    const fetchRecordTypes = useCallback(() => {
        setProgress(0);

        recordTypeService
            .list({ criteria: 1, organization_id: activeOrganization.id })
            .then((res) => {
                setRecordTypes(res.data);
            })
            .finally(() => setProgress(100));
    }, [activeOrganization.id, recordTypeService, setProgress]);

    const fetchTags = useCallback(() => {
        setProgress(0);

        tagService
            .list({ scope: 'webshop', per_page: 1000 })
            .then((res) => {
                setTags(res.data.data);
            })
            .finally(() => setProgress(100));
    }, [setProgress, tagService]);

    const selectPhoto = useCallback((file: File | Blob) => {
        setFundPhoto(file);
    }, []);

    const updateFormFormulaProduct = useCallback(
        (formula_id, field_name, field_value) => {
            const formulaProducts = form.values.formula_products;
            formulaProducts[formula_id] = {
                ...formulaProducts[formula_id],
                [field_name]: field_value,
            };
            form.update({
                formula_products: formulaProducts,
            });
        },
        [form],
    );

    const updateProductOptions = useCallback(() => {
        const productOptions = products.filter((product) => {
            return (
                form.values.formula_products
                    .map((item: FundFormulaProduct) => (item.product_id ? item.product_id : false))
                    .filter((id: number) => !!id)
                    .indexOf(product.id) === -1
            );
        });

        const options = [];
        form.values.formula_products.forEach((el: FundFormulaProduct, index: number) => {
            const product = el.product_id ? products.filter((item) => item.id == el.product_id)[0] : false;

            options[index] = sortBy(productOptions.concat(product ? [product] : []), (product: Product) => {
                return product.name;
            });
        });
        setProductOptions(options);
    }, [form.values.formula_products, products]);

    const removeProduct = useCallback(
        (product: FundFormulaProduct) => {
            let index: number;

            if ((index = form.values.formula_products.indexOf(product)) != -1) {
                form.values.formula_products.splice(index, 1);
            }

            updateProductOptions();
        },
        [form.values.formula_products, updateProductOptions],
    );

    const addProduct = useCallback(() => {
        form.values.formula_products.push({
            product_id: null,
            record_type_key_multiplier: null,
        });
        form.update({ formula_products: form.values.formula_products });

        updateProductOptions();
    }, [form, updateProductOptions]);

    const getApplicationMethodKey = useCallback(() => {
        if (fund?.allow_fund_requests) {
            return fund.allow_prevalidations ? 'all' : 'application_form';
        }

        return fund?.allow_prevalidations ? 'activation_codes' : 'none';
    }, [fund?.allow_fund_requests, fund?.allow_prevalidations]);

    useEffect(() => {
        fetchValidators();
    }, [fetchValidators]);

    useEffect(() => {
        fetchValidatorOrganizations();
    }, [fetchValidatorOrganizations]);

    useEffect(() => {
        if (fund_id) {
            fetchFund(fund_id);
        }
    }, [fetchFund, fund_id]);

    useEffect(() => {
        fetchTags();
    }, [fetchTags]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    useEffect(() => {
        fetchRecordTypes();
    }, [fetchRecordTypes]);

    useEffect(() => {
        if (form.values.formula_products && products && Array.isArray(products)) {
            updateProductOptions();
        }
    }, [form.values.formula_products, products, updateProductOptions]);

    useEffect(() => {
        if (fund) {
            delete fund.organization;
            updateForm({
                ...fund,
                tag_ids: Array.isArray(fund.tags) ? fund.tags.map((tag) => tag.id) : [],
                application_method: getApplicationMethodKey(),
            });
            setFaq(fund?.faq || []);
        }
    }, [updateForm, fund, tags, getApplicationMethodKey]);

    useEffect(() => {
        recordTypes.unshift({
            key: null,
            name: 'Wijs 1 tegoed',
        });

        setRecordTypesMultiplier(
            recordTypes.map((recordType: RecordType) => ({
                ...recordType,
                name: `Vermenigvuldig met: ${recordType.name}`,
            })),
        );
    }, [recordTypes]);

    if (!fund || (fund_id && !fund)) {
        return <LoadingCard />;
    }

    return (
        <Fragment>
            <div className="block block-breadcrumbs">
                <StateNavLink
                    name={'organization-funds'}
                    params={{ organizationId: activeOrganization.id }}
                    className="breadcrumb-item">
                    Fondsen
                </StateNavLink>

                {fund_id && <div className="breadcrumb-item active">{fund?.name}</div>}

                {!fund_id && <div className="breadcrumb-item active">{t('funds_edit.header.title_add')}</div>}
            </div>

            <div className="card">
                <form className="form" onSubmit={form.submit}>
                    <div className="card-header">
                        {!fund ? (
                            <div className="card-title">{t('funds_edit.header.title_add')}</div>
                        ) : (
                            <div className="card-title">{t('funds_edit.header.title_edit')}</div>
                        )}
                    </div>

                    <div className="card-section card-section-primary">
                        <div className="form-group form-group-inline">
                            <label className="form-label hidden-md">&nbsp;</label>
                            <div className="form-offset">
                                <PhotoSelector
                                    type={'fund_logo'}
                                    thumbnail={fund?.logo?.sizes?.thumbnail}
                                    selectPhoto={selectPhoto}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="card-section card-section-primary">
                        <div className="row">
                            <div className="col col-lg-9 col-xs-12">
                                <div className="form-group form-group-inline">
                                    <label className="form-label form-label-required">
                                        {t('funds_edit.labels.name')}
                                    </label>
                                    <input
                                        className="form-control"
                                        defaultValue={form.values.name}
                                        type="text"
                                        placeholder="Naam"
                                        onChange={(e) =>
                                            form.update({
                                                name: e.target.value,
                                            })
                                        }
                                    />
                                    <FormError error={form.errors?.name} />
                                    <input type="hidden" defaultValue={form.values.state} />
                                </div>

                                <div className="form-group form-group-inline">
                                    <label className="form-label">{t('funds_edit.labels.description_short')}</label>
                                    <div className="form-offset">
                                        <textarea
                                            className="form-control r-n"
                                            maxLength={500}
                                            placeholder="Omschrijving"
                                            defaultValue={form.values.description_short}
                                            onChange={(e) =>
                                                form.update({
                                                    description_short: e.target.value,
                                                })
                                            }
                                        />
                                        <div className="form-hint">Max. 500 tekens</div>
                                        <FormError error={form.errors?.description_short}></FormError>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {!form.values.external_page && (
                        <div className="card-section card-section-primary">
                            <div className="row">
                                <div className="col col-lg-9 col-xs-12">
                                    <div className="form-group form-group-inline tooltipped">
                                        <label className="form-label">Verberg details</label>
                                        <CheckboxControl
                                            id={'hide_meta'}
                                            checked={!!form.values.hide_meta}
                                            onChange={(e) => form.update({ hide_meta: e.target.checked })}
                                            title={'Verberg de detail informatie van het fonds op de webshop'}
                                        />
                                        <Tooltip
                                            text={
                                                'De datails die verborgen worden, zijn: Uitgifte door, tegoed per persoon, startdatum en einddatum van het fonds'
                                            }
                                        />
                                        <FormError error={form.errors?.hide_meta} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="card-section card-section-primary">
                        <div className="row">
                            <div className="col col-lg-9 col-xs-12">
                                <div className="form-group form-group-inline">
                                    <label className="form-label form-label-required">Soort fonds</label>
                                    {!fund && (
                                        <SelectControl
                                            className="form-control"
                                            propKey={'key'}
                                            allowSearch={false}
                                            value={form.values.fund_type}
                                            options={fundTypes}
                                            optionsComponent={SelectControlOptions}
                                            disabled={!hasPermission(activeOrganization, 'manage_funds')}
                                            onChange={(fund_type: string) => form.update({ fund_type })}
                                        />
                                    )}
                                    <FormError error={form.errors?.type} />

                                    {fund && (
                                        <div className="form-offset">
                                            <div className="block block-fund_types">
                                                {form.values.type == 'budget' && (
                                                    <div className="fund_type-item fund_type-item-read">
                                                        <div className="fund_type-item-inner">
                                                            <div className="fund_type-media">
                                                                <img
                                                                    className="fund_type-media-img"
                                                                    src={assetUrl(
                                                                        '/assets/img/fund-types/icon-fund-actions-read.svg',
                                                                    )}
                                                                    alt={''}
                                                                />
                                                            </div>
                                                            <div className="fund_type-name">Financieel budget</div>
                                                            <div className="fund_type-check">
                                                                <div className="mdi mdi-check" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {form.values.type == 'subsidies' && (
                                                    <div className="fund_type-item fund_type-item-read">
                                                        <div className="fund_type-item-inner">
                                                            <div className="fund_type-media">
                                                                <img
                                                                    className="fund_type-media-img"
                                                                    src={assetUrl(
                                                                        '/assets/img/fund-types/icon-fund-budget-read.svg',
                                                                    )}
                                                                    alt={''}
                                                                />
                                                            </div>
                                                            <div className="fund_type-name">Acties</div>
                                                            <div className="fund_type-check">
                                                                <div className="mdi mdi-check" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {form.values.type == 'external' && (
                                                    <div className="fund_type-item fund_type-item-read">
                                                        <div className="fund_type-item-inner">
                                                            <div className="fund_type-media">
                                                                <img
                                                                    className="fund_type-media-img"
                                                                    src={assetUrl(
                                                                        '/assets/img/fund-types/icon-fund-external-read.svg',
                                                                    )}
                                                                    alt={''}
                                                                />
                                                            </div>

                                                            <div className="fund_type-name">
                                                                Informatief (met doorlink)
                                                            </div>

                                                            <div className="fund_type-check">
                                                                <div className="mdi mdi-check" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {form.values.type == 'external' && (
                        <div className="card-section card-section-primary">
                            <div className="row">
                                <div className="col col-lg-9 col-xs-12">
                                    <div className="form-group form-group-inline">
                                        <label className="form-label">Pagina type</label>
                                        <div className="form-offset">
                                            <div className="form-group-info">
                                                <div className="form-group-info-control">
                                                    <SelectControl
                                                        className="form-control"
                                                        propKey={'value'}
                                                        allowSearch={false}
                                                        value={form.values.external_page}
                                                        options={externalFundPageTypes}
                                                        optionsComponent={SelectControlOptions}
                                                        onChange={(external_page: boolean) =>
                                                            form.update({ external_page })
                                                        }
                                                    />
                                                </div>
                                                <div className="form-group-info-button">
                                                    <div
                                                        className={`button button-default button-icon pull-left ${
                                                            showInfoBlock ? 'active' : ''
                                                        }`}
                                                        onClick={() => setShowInfoBlock(!showInfoBlock)}>
                                                        <em className="mdi mdi-information" />
                                                    </div>
                                                </div>
                                            </div>

                                            {showInfoBlock && (
                                                <div className="block block-info-box block-info-box-primary">
                                                    <div className="info-box-icon mdi mdi-information" />
                                                    <div className="info-box-content">
                                                        <div className="block block-markdown">
                                                            <h4>Kies de juiste instelling</h4>
                                                            <p>
                                                                Een interne pagina leidt de gebruiker eerst door naar
                                                                een pagina binnen de webshop. Een externe pagina leidt
                                                                de gebruiker na het klikken direct door naar de URL die
                                                                is ingevuld.
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                            <FormError error={form.errors?.external_page} />
                                        </div>
                                    </div>

                                    {form.values.external_page && (
                                        <div className="form-group form-group-inline">
                                            <label className="form-label form-label-required">Externe url</label>
                                            <input
                                                className="form-control"
                                                placeholder="https://gemeente+1.nl/aanmelden"
                                                defaultValue={form.values.external_page_url}
                                                onChange={(e) =>
                                                    form.update({
                                                        external_page_url: e.target.value,
                                                    })
                                                }
                                            />
                                            <FormError error={form.errors?.external_page_url} />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {tags?.length && (
                        <div className="card-section card-section-primary">
                            <div className="row">
                                <div className="col col-lg-9 col-xs-12">
                                    <div className="form-group form-group-inline">
                                        <MultiSelectControl
                                            label="Categorieën"
                                            options={tags}
                                            defaultValue={form.values?.tag_ids}
                                            onChange={(tag_ids: Array<number>) => form.update({ tag_ids })}
                                        />
                                        <FormError error={form.errors?.tag} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {form.values.type != 'external' && (
                        <div className="card-section card-section-primary">
                            <div className="row">
                                <div className="col col-lg-9 col-xs-12">
                                    <div className="form-group form-group-inline">
                                        <div className="form-label form-label-required">
                                            {t('funds_edit.labels.application_method')}
                                        </div>
                                        <SelectControl
                                            className={`form-control ${
                                                (fund && fund.state != 'waiting') ||
                                                !hasPermission(activeOrganization, 'manage_funds')
                                                    ? 'disabled'
                                                    : ''
                                            }`}
                                            propKey={'key'}
                                            allowSearch={false}
                                            value={form.values.application_method}
                                            options={applicationMethods}
                                            optionsComponent={SelectControlOptions}
                                            disabled={
                                                (fund && fund.state != 'waiting') ||
                                                !hasPermission(activeOrganization, 'manage_funds')
                                            }
                                            onChange={(application_method: string) =>
                                                form.update({ application_method })
                                            }
                                        />
                                    </div>

                                    {form.values.application_method != 'none' && (
                                        <div className="form-group form-group-inline">
                                            <label className="form-label form-label-required">
                                                {t('funds_edit.labels.request_btn_text')}
                                            </label>
                                            <input
                                                className="form-control"
                                                type="text"
                                                defaultValue={form.values.request_btn_text}
                                                placeholder="Aanvragen"
                                                onChange={(e) =>
                                                    form.update({
                                                        request_btn_text: e.target.value,
                                                    })
                                                }
                                            />
                                            <FormError error={form.errors?.request_btn_text} />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {!form.values.external_page && (
                        <div className="card-section card-section-primary">
                            <div className="row">
                                <div className="col col-lg-9 col-xs-12">
                                    <div className="form-group form-group-inline">
                                        <label className="form-label">
                                            {t('funds_edit.labels.external_link_text')}
                                        </label>
                                        <input
                                            className="form-control"
                                            placeholder="Aanvragen"
                                            defaultValue={form.values.external_link_text}
                                            onChange={(e) =>
                                                form.update({
                                                    external_link_text: e.target.value,
                                                })
                                            }
                                        />
                                        <FormError error={form.errors?.external_link_text} />
                                    </div>

                                    <div className="form-group form-group-inline">
                                        <label className="form-label">{t('funds_edit.labels.external_link_url')}</label>
                                        <div className="form-offset">
                                            <input
                                                className="form-control"
                                                placeholder="https://gemeente+1.nl/aanmelden"
                                                defaultValue={form.values.external_link_url}
                                                onChange={(e) =>
                                                    form.update({
                                                        external_link_url: e.target.value,
                                                    })
                                                }
                                            />
                                        </div>
                                        <FormError error={form.errors?.external_link_url} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {!form.values.external_page && (
                        <div className="card-section card-section-primary">
                            <div className="row">
                                <div className="col col-lg-9 col-xs-12">
                                    <div className="form-group form-group-inline">
                                        <label className="form-label">{t('funds_edit.labels.description')}</label>
                                        <div className="form-offset">
                                            <MarkdownEditor
                                                value={form.values?.description_html || ''}
                                                onChange={(description) => form.update({ description })}
                                                extendedOptions={true}
                                                placeholder={t('organization_edit.labels.description')}
                                            />
                                        </div>
                                        <FormError error={form.errors?.description} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {!form.values.external_page && (
                        <div className="card-section card-section-primary">
                            <div className="form-group form-group-inline">
                                <label className="form-label">Titel van blok</label>
                                <input
                                    className="form-control"
                                    placeholder="Veel gestelde vragen"
                                    defaultValue={form.values.faq_title}
                                    onChange={(e) =>
                                        form.update({
                                            faq_title: e.target.value,
                                        })
                                    }
                                />
                                <FormError error={form.errors?.faq_title} />
                            </div>

                            <div className="form-group form-group-inline">
                                <label className="form-label">Veel gestelde vragen</label>
                                <div className="form-offset">
                                    <FaqEditor
                                        faq={faq}
                                        organization={activeOrganization}
                                        setFaq={setFaq}
                                        errors={form?.errors}
                                        setErrors={(errors: ResponseErrorData) => form.setErrors(errors)}
                                        createFaqRef={faqEditorBlock}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {!form.values.external_page && (
                        <div className="card-section card-section-primary">
                            <div className="row">
                                <div className="col col-lg-9 col-lg-12">
                                    <div className="form-group form-group-inline">
                                        <label className="form-label form-label-required">
                                            {t('funds_edit.labels.description_position')}
                                        </label>
                                        <div className="form-offset">
                                            <SelectControl
                                                className="form-control"
                                                propKey={'value'}
                                                allowSearch={false}
                                                value={form.values.descriptionPosition}
                                                options={descriptionPositions}
                                                optionsComponent={SelectControlOptions}
                                                onChange={(descriptionPosition: string) =>
                                                    form.update({ descriptionPosition })
                                                }
                                            />
                                            <FormError error={form.errors?.description_position} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="card-section card-section-primary">
                        <div className="row">
                            <div className="col col-lg-9 col-lg-12">
                                <div className="form-group form-group-inline">
                                    <label className="form-label form-label-required">
                                        {t('funds_edit.labels.start')}
                                    </label>
                                    <DatePickerControl
                                        value={dateParse(form.values.start_date)}
                                        placeholder={t('dd-MM-yyyy')}
                                        disabled={
                                            form.values.state != 'waiting' ||
                                            !hasPermission(activeOrganization, 'manage_funds')
                                        }
                                        onChange={(start_date: Date) => {
                                            form.update({ start_date: dateFormat(start_date) });
                                        }}
                                    />
                                </div>

                                <div className="form-group form-group-inline">
                                    <label className="form-label form-label-required">
                                        {t('funds_edit.labels.end')}
                                    </label>
                                    <DatePickerControl
                                        value={dateParse(form.values.end_date)}
                                        placeholder={t('dd-MM-yyyy')}
                                        disabled={
                                            form.values.state != 'waiting' ||
                                            !hasPermission(activeOrganization, 'manage_funds')
                                        }
                                        onChange={(end_date: Date) => {
                                            form.update({ end_date: dateFormat(end_date) });
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {appConfigs.organizations.funds.formula_products &&
                        hasPermission(activeOrganization, 'manage_funds') &&
                        !form.values.external_page && (
                            <div className="card-section card-section-primary">
                                {form.values.formula_products.map(
                                    (formula_product: FundFormulaProduct, index: number) => (
                                        <div className="form-group form-group-inline" key={index}>
                                            <div className="form-label">
                                                {index == 0 ? t('funds_edit.labels.products') : ''}
                                            </div>

                                            <div className="form-offset">
                                                <div className="flex-row">
                                                    <div className="flex-col flex-grow">
                                                        <div className="flex-row flex-grow">
                                                            <div className="flex-col flex-col-4">
                                                                <SelectControl
                                                                    className="form-control"
                                                                    propKey={'id'}
                                                                    value={formula_product.product_id}
                                                                    placeholder="Selecteer aanbieding..."
                                                                    options={productOptions[index]}
                                                                    optionsComponent={SelectControlOptions}
                                                                    disabled={
                                                                        !hasPermission(
                                                                            activeOrganization,
                                                                            'manage_funds',
                                                                        )
                                                                    }
                                                                    onChange={(product_id: number) => {
                                                                        updateFormFormulaProduct(
                                                                            index,
                                                                            'product_id',
                                                                            product_id,
                                                                        );
                                                                    }}
                                                                />
                                                                <FormError
                                                                    error={
                                                                        form.errors[
                                                                            `formula_products.${index}.product_id`
                                                                        ]
                                                                    }></FormError>
                                                            </div>
                                                            <div className="flex-col flex-col-2">
                                                                <SelectControl
                                                                    className="form-control"
                                                                    propKey={'key'}
                                                                    value={formula_product.record_type_key_multiplier}
                                                                    placeholder="Selecteer aanbieding..."
                                                                    options={recordTypesMultiplier}
                                                                    optionsComponent={SelectControlOptions}
                                                                    disabled={
                                                                        !hasPermission(
                                                                            activeOrganization,
                                                                            'manage_funds',
                                                                        )
                                                                    }
                                                                    onChange={(record_type_key_multiplier: string) => {
                                                                        updateFormFormulaProduct(
                                                                            index,
                                                                            'record_type_key_multiplier',
                                                                            record_type_key_multiplier,
                                                                        );
                                                                    }}
                                                                />
                                                                <FormError
                                                                    error={
                                                                        form.errors[
                                                                            'formula_products.' +
                                                                                index +
                                                                                '.record_type_key_multiplier'
                                                                        ]
                                                                    }></FormError>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex-col">
                                                        <div
                                                            className="button button-primary button-icon"
                                                            onClick={() => removeProduct(formula_product)}>
                                                            <em className="mdi mdi-close" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ),
                                )}

                                <div className="form-group form-group-inline">
                                    <label className="form-label">
                                        {!form.values.formula_products.length ? t('funds_edit.labels.products') : ''}
                                    </label>
                                    <div className="button button-primary" onClick={() => addProduct()}>
                                        <em className="mdi mdi-plus-circle icon-start" />
                                        Aanbieding toevoegen
                                    </div>
                                </div>
                            </div>
                        )}

                    {!form.values.external_page && (
                        <div className="card-section card-section-primary">
                            <div className="row">
                                <div className="form-group form-group-inline col col-lg-9 col-md-12">
                                    <label className="form-label">Standaard validator</label>
                                    <div className="form-offset">
                                        <SelectControl
                                            className="form-control"
                                            propKey={'id'}
                                            propValue={'email'}
                                            allowSearch={false}
                                            value={form.values.default_validator_employee_id}
                                            options={validators}
                                            optionsComponent={SelectControlOptions}
                                            disabled={!hasPermission(activeOrganization, 'manage_funds')}
                                            onChange={(default_validator_employee_id: number) =>
                                                form.update({ default_validator_employee_id })
                                            }
                                        />
                                    </div>
                                    <FormError error={form.errors?.default_validator_employee_id} />
                                </div>

                                {form.values.default_validator_employee_id && (
                                    <div className="form-group form-group-inline col col-lg-9 col-md-12">
                                        <label className="form-label">Aanmeldingen</label>
                                        <CheckboxControl
                                            title={'Automatisch goedkeuren wanneer er een BSN-nummer vast staat.'}
                                            disabled={!hasPermission(activeOrganization, 'manage_funds')}
                                            checked={form.values.auto_requests_validation}
                                            onChange={(e) =>
                                                form.update({ auto_requests_validation: e.target.checked })
                                            }
                                        />
                                        <FormError error={form.errors?.auto_requests_validation} />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {appConfigs.organizations.funds.criteria && !form.values.external_page && (
                        <Fragment>
                            {form.values.criteria?.length > 0 && hasPermission(activeOrganization, 'manage_funds') && (
                                <div className="card-section card-section-primary">
                                    <div className="form-group form-group-inline">
                                        <div className="form-label">Criteria</div>
                                        <div className="form-offset">
                                            <FundCriteriaEditor
                                                fund={fund}
                                                organization={fund.organization}
                                                criteria={form.values.criteria}
                                                isEditable={fund.criteria_editable}
                                                setCriteria={(criteria) => setFund({ ...fund, criteria })}
                                                recordTypes={recordTypes}
                                                validatorOrganizations={validatorOrganizations.data}
                                                saveCriteriaRef={criteriaBlockRef}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </Fragment>
                    )}

                    {!form.values.external_page && (
                        <div className="card-section card-section-primary">
                            <div className="row">
                                <div className="col col-lg-9 col-lg-12">
                                    <div className="form-group form-group-inline">
                                        <div className="form-label">Instellingen aanvraagformulier</div>
                                        <div className="form-offset">
                                            <FundConfigContactInfoEditor
                                                fund={fund}
                                                disabled={!hasPermission(activeOrganization, 'manage_funds')}
                                                inline={false}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {!form.values.external_page && (
                        <div className="card-section card-section-primary">
                            <div className="row">
                                <div className="col col-lg-9 col-lg-12">
                                    <div className="form-group form-group-inline">
                                        <div className="form-label">{t('funds_edit.labels.notification_amount')}</div>
                                        <input
                                            className="form-control"
                                            type="number"
                                            defaultValue={form.values.notification_amount}
                                            disabled={!hasPermission(activeOrganization, 'manage_funds')}
                                            placeholder={t('funds_edit.labels.notification_amount')}
                                        />
                                        <FormError error={form.errors?.notification_amount} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="card-section card-section-primary">
                        <div className="text-center">
                            <button
                                type="button"
                                className="button button-default"
                                onClick={() => cancel()}
                                id="cancel">
                                {t('funds_edit.buttons.cancel')}
                            </button>
                            <button type="submit" className="button button-primary" id="cancel">
                                {t('funds_edit.buttons.confirm')}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </Fragment>
    );
}
