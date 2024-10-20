import React, { Fragment, useCallback, useEffect, useState } from 'react';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import { useParams } from 'react-router-dom';
import Product, { DealHistory } from '../../../props/models/Product';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import LoadingCard from '../../elements/loading-card/LoadingCard';
import { ResponseError } from '../../../props/ApiResponses';
import FundProviderChat from '../../../props/models/FundProviderChat';
import useOpenModal from '../../../hooks/useOpenModal';
import usePushSuccess from '../../../hooks/usePushSuccess';
import usePushDanger from '../../../hooks/usePushDanger';
import { strLimit } from '../../../helpers/string';
import Tooltip from '../../elements/tooltip/Tooltip';
import FundProviderProductEditor from './elements/FundProviderProductEditor';
import useUpdateProduct from '../fund-provider/hooks/useUpdateProduct';
import ModalDangerZone from '../../modals/ModalDangerZone';
import useSetProgress from '../../../hooks/useSetProgress';
import { useFundService } from '../../../services/FundService';
import Fund from '../../../props/models/Fund';
import FundProvider from '../../../props/models/FundProvider';
import useFundProviderChatService from '../../../services/FundProviderChatService';
import ModalFundProviderChatSponsor from '../../modals/ModalFundProviderChatSponsor';
import ModalFundProviderChatMessage from '../../modals/ModalFundProviderChatMessage';
import useTranslate from '../../../hooks/useTranslate';
import useAssetUrl from '../../../hooks/useAssetUrl';

type ProductLocal = Product & {
    allowed?: boolean;
    hasLimits?: boolean;
};

export default function FundProviderProductView() {
    const { id, fundId, fundProviderId } = useParams();

    const assetUrl = useAssetUrl();
    const translate = useTranslate();
    const openModal = useOpenModal();
    const pushDanger = usePushDanger();
    const pushSuccess = usePushSuccess();
    const setProgress = useSetProgress();
    const activeOrganization = useActiveOrganization();
    const { updateProduct, disableProduct } = useUpdateProduct();

    const fundService = useFundService();
    const fundProviderChatService = useFundProviderChatService();

    const [deal, setDeal] = useState<DealHistory>(null);
    const [fund, setFund] = useState<Fund>(null);
    const [product, setProduct] = useState<ProductLocal>(null);
    const [showEditor, setShowEditor] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [fundProvider, setFundProvider] = useState<FundProvider>(null);
    const [fundProviderProductChat, setFundProviderProductChat] = useState<FundProviderChat>(null);

    const disableProviderProduct = useCallback(
        (product: Product) => {
            disableProduct(fundProvider, product).then((res) => setFundProvider(res));
        },
        [disableProduct, fundProvider],
    );

    const confirmDangerAction = useCallback(
        (title, description_text, cancelButton = 'Annuleren', confirmButton = 'Bevestigen') => {
            return new Promise((resolve) => {
                openModal((modal) => (
                    <ModalDangerZone
                        modal={modal}
                        title={title}
                        description={description_text}
                        buttonCancel={{
                            text: cancelButton,
                            onClick: () => {
                                modal.close();
                                resolve(false);
                            },
                        }}
                        buttonSubmit={{
                            text: confirmButton,
                            onClick: () => {
                                modal.close();
                                resolve(true);
                            },
                        }}
                    />
                ));
            });
        },
        [openModal],
    );

    const mapProduct = useCallback(
        (data: Product): ProductLocal => {
            return {
                ...data,
                allowed: fundProvider.products.indexOf(data.id) !== -1,
                hasLimits: data.deals_history.filter((deal) => deal.active).length > 0,
            };
        },
        [fundProvider?.products],
    );

    const fetchProduct = useCallback(async () => {
        try {
            const res = await fundService.getProviderProduct(
                activeOrganization.id,
                parseInt(fundId),
                parseInt(fundProviderId),
                parseInt(id),
            );

            return setProduct(mapProduct(res.data.data));
        } catch (res) {
            return pushDanger('Mislukt!', res.data.message);
        }
    }, [fundService, activeOrganization.id, fundId, fundProviderId, id, mapProduct, pushDanger]);

    const resetLimits = useCallback(
        (deal) => {
            confirmDangerAction(
                'Limiet verwijderen?',
                [
                    'U staat op het punt limieten van het aanbod te verwijderen, hiermee wordt het aanbod niet uit de webshop verwijderd.',
                    'In plaats daarvan wordt het totale limiet, limiet per tegoed en de vervaldatum van het aanbod verwijderd.\n\n',
                    'Wilt u het aabod van de webshop verwijderen? Sluit dan dit venster en gebruik de schakelaar in het bovenste gedeelte van deze pagina.',
                ].join(' '),
            ).then((confirmed = false) => {
                if (!confirmed) {
                    return;
                }

                fundService
                    .updateProvider(fund.organization_id, fund.id, fundProvider.id, {
                        reset_products: [{ id: deal.product_id }],
                    })
                    .then((res) => {
                        setFundProvider(res.data.data);
                        fetchProduct().then(() => pushSuccess('De limieten zijn hersteld.'));
                    })
                    .catch((err: ResponseError) => pushDanger('Foutmelding!', err.data.message))
                    .finally(() => setDeal(null));
            });
        },
        [
            fund?.id,
            pushDanger,
            pushSuccess,
            fundService,
            fetchProduct,
            fundProvider?.id,
            confirmDangerAction,
            fund?.organization_id,
        ],
    );

    const updateAllowBudgetItem = useCallback(
        (product: Product, allowed: boolean) => {
            const enable_products = allowed ? [{ id: product.id }] : [];
            const disable_products = !allowed ? [product.id] : [];

            updateProduct(fundProvider, { enable_products, disable_products }).then((res) => {
                setFundProvider(res);
                fetchProduct().then((r) => r);
            });
        },
        [fetchProduct, fundProvider, updateProduct],
    );

    const onCancel = useCallback(() => {
        setDeal(null);
        setShowEditor(false);
    }, []);

    const onUpdate = useCallback(
        (fundProvider: FundProvider) => {
            setFundProvider(fundProvider);

            fetchProduct().then(() => {
                onCancel();
                pushSuccess('Het aanbod is goedgekeurd.');
            });
        },
        [fetchProduct, onCancel, pushSuccess],
    );

    const fetchChat = useCallback(() => {
        fundProviderChatService
            .list(activeOrganization.id, parseInt(fundId), parseInt(fundProviderId), {
                product_id: parseInt(id),
            })
            .then((res) => setFundProviderProductChat(res.data.data[0] || null))
            .catch((err: ResponseError) => pushDanger('Mislukt!', err.data.message))
            .finally(() => setProgress(100));
    }, [fundProviderChatService, activeOrganization.id, fundId, fundProviderId, id, pushDanger, setProgress]);

    const showTheChat = useCallback(() => {
        if (!fundProviderProductChat) {
            return;
        }

        openModal(
            (modal) => (
                <ModalFundProviderChatSponsor
                    modal={modal}
                    fund={fund}
                    product={product}
                    chat={fundProviderProductChat}
                    organization={activeOrganization}
                    fundProvider={fundProvider}
                />
            ),
            { onClosed: fetchChat },
        );
    }, [activeOrganization, fetchChat, fund, fundProvider, fundProviderProductChat, openModal, product]);

    const makeChat = useCallback(() => {
        openModal((modal) => (
            <ModalFundProviderChatMessage
                modal={modal}
                product={product}
                fund={fund}
                fundProvider={fundProvider}
                organization={activeOrganization}
                onSubmit={(chat) => {
                    setFundProviderProductChat(chat);
                    pushSuccess('Opgeslagen!');
                    showTheChat();
                }}
            />
        ));
    }, [activeOrganization, fund, fundProvider, openModal, product, pushSuccess, showTheChat]);

    const fetchFundProvider = useCallback(() => {
        setProgress(0);

        fundService
            .readProvider(activeOrganization.id, parseInt(fundId), parseInt(fundProviderId))
            .then((res) => setFundProvider(res.data.data))
            .catch((err: ResponseError) => pushDanger('Mislukt!', err.data.message))
            .finally(() => setProgress(100));
    }, [setProgress, fundService, activeOrganization.id, fundId, fundProviderId, pushDanger]);

    const fetchFund = useCallback(() => {
        setProgress(0);

        fundService
            .readPublic(parseInt(fundId))
            .then((res) => setFund(res.data.data))
            .catch((err: ResponseError) => pushDanger('Mislukt!', err.data?.message))
            .finally(() => setProgress(100));
    }, [fundId, fundService, pushDanger, setProgress]);

    useEffect(() => {
        fetchFund();
    }, [fetchFund]);

    useEffect(() => {
        fetchChat();
    }, [fetchChat]);

    useEffect(() => {
        fetchFundProvider();
    }, [fetchFundProvider]);

    useEffect(() => {
        if (fundProvider) {
            fetchProduct().then((r) => r);
        }
    }, [fetchProduct, fundProvider]);

    if (!product || !fund || !fundProvider) {
        return <LoadingCard />;
    }

    return (
        <Fragment>
            <div className="block block-breadcrumbs">
                <StateNavLink
                    name={'sponsor-provider-organizations'}
                    params={{ organizationId: activeOrganization.id }}
                    activeExact={true}
                    className="breadcrumb-item">
                    {translate('page_state_titles.organization-providers')}
                </StateNavLink>
                <StateNavLink
                    name={'sponsor-provider-organization'}
                    params={{ id: fundProvider.organization.id, organizationId: activeOrganization.id }}
                    activeExact={true}
                    className="breadcrumb-item">
                    {strLimit(fundProvider.organization.name, 40)}
                </StateNavLink>
                <StateNavLink
                    name={'fund-provider'}
                    params={{ id: fundProvider.id, fundId: fund.id, organizationId: activeOrganization.id }}
                    activeExact={true}
                    className="breadcrumb-item">
                    {strLimit(fundProvider.fund.name, 40)}
                </StateNavLink>
                <div className="breadcrumb-item active">{strLimit(product.name, 40)}</div>
            </div>

            <div className="block block-provider-product">
                <div className="product-overview">
                    <div className="product-media">
                        <img
                            className="product-media-img"
                            src={product.photo?.sizes?.small || assetUrl('/assets/img/placeholders/product-small.png')}
                            alt={product.name}
                        />
                    </div>
                    <div className="product-details">
                        <div className="product-name">{product.name}</div>
                        <div className="product-properties">
                            <div className="product-property">
                                <div className="product-property-label">{translate('product_edit.labels.expire')}</div>
                                <div className="product-property-value">
                                    {product.expire_at ? product.expire_at_locale : 'Onbeperkt'}
                                </div>
                            </div>
                            <div className="product-property">
                                <div className="product-property-label">{translate('product_edit.labels.sold')}</div>
                                <div className="product-property-value">{product.sold_amount}</div>
                            </div>
                            <div className="product-property">
                                <div className="product-property-label">
                                    {translate('product_edit.labels.reserved')}
                                </div>
                                <div className="product-property-value">{product.reserved_amount}</div>
                            </div>
                        </div>
                    </div>

                    <div className="product-actions form">
                        <div className="product-price">{product.price_locale}</div>
                        {fundProvider.fund.type == 'budget' && (
                            <div className="form-group form-group-inline">
                                <label
                                    className={`form-toggle ${
                                        fundProvider.allow_products ? 'form-toggle-disabled form-toggle-active' : ''
                                    }`}
                                    htmlFor={`product_${product.id}_enabled`}>
                                    <input
                                        type="checkbox"
                                        id={`product_${product.id}_enabled`}
                                        checked={product.allowed}
                                        onChange={(e) => updateAllowBudgetItem(product, e.target.checked)}
                                    />
                                    <div className="form-toggle-inner">
                                        <div className="toggle-input">
                                            <div className="toggle-input-dot" />
                                        </div>
                                    </div>
                                </label>
                            </div>
                        )}

                        {fundProvider.fund.type == 'subsidies' && (
                            <div className="flex flex-end">
                                {product.is_available && !product.allowed && (
                                    <StateNavLink
                                        name={'fund-provider-product-subsidy-edit'}
                                        params={{
                                            id: product.id,
                                            fundId: fundProvider.fund_id,
                                            fundProviderId: fundProvider.id,
                                            organizationId: activeOrganization.id,
                                        }}
                                        className="button button-primary button-sm nowrap">
                                        <em className="mdi mdi-play icon-start" />
                                        Start subsidie
                                    </StateNavLink>
                                )}

                                {product.is_available && product.allowed && (
                                    <div className="tag tag-success nowrap">
                                        Subsidie actief
                                        <em
                                            className="mdi mdi-close icon-end clickable"
                                            onClick={() => disableProviderProduct(product)}
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="product-description">
                    <div className="description-header">
                        Beschrijving
                        <div className="description-header-action">
                            {!product.sponsor_organization_id && !fundProviderProductChat && (
                                <button
                                    type="button"
                                    className="button button-primary-light"
                                    onClick={() => makeChat()}>
                                    <em className="mdi mdi-message-text icon-start" />
                                    Nieuw aanpassingsverzoek
                                </button>
                            )}

                            {product.sponsor_organization_id === activeOrganization.id && !fundProviderProductChat && (
                                <StateNavLink
                                    className="button button-primary"
                                    name={'fund-provider-product-edit'}
                                    params={{
                                        id: product.id,
                                        fundId: fundProvider.fund_id,
                                        fundProviderId: fundProvider.id,
                                        organizationId: activeOrganization.id,
                                    }}>
                                    <em className="mdi mdi-pencil icon-start" />
                                    Bewerken
                                </StateNavLink>
                            )}
                        </div>
                        {!product.sponsor_organization && fundProviderProductChat && (
                            <div className="description-header-action">
                                {fundProviderProductChat.sponsor_unseen_messages > 0 && (
                                    <span>{fundProviderProductChat.sponsor_unseen_messages} nieuwe</span>
                                )}

                                <button
                                    type="button"
                                    className={`button button-icon ${
                                        fundProviderProductChat.sponsor_unseen_messages > 0
                                            ? 'button-primary-light'
                                            : 'button-default'
                                    }`}
                                    disabled={!fundProviderProductChat}
                                    onClick={() => showTheChat()}>
                                    <em
                                        className={`mdi mdi-message-text ${
                                            fundProviderProductChat && !fundProviderProductChat.sponsor_unseen_messages
                                                ? 'text-primary'
                                                : ''
                                        }`}
                                    />
                                </button>
                            </div>
                        )}
                    </div>

                    {product.description_html ? (
                        <div className="description-body">
                            <div className="arrow-box border bg-dim">
                                <div className="arrow" />
                            </div>
                            <div dangerouslySetInnerHTML={{ __html: product.description_html }} />
                        </div>
                    ) : (
                        <div className="description-body">
                            <div className="arrow-box border bg-dim">
                                <div className="arrow" />
                            </div>
                            Geen data
                        </div>
                    )}
                </div>
            </div>

            {activeOrganization.allow_budget_fund_limits &&
                fund.type == 'budget' &&
                !product.hasLimits &&
                !deal &&
                !showEditor && (
                    <div className="card">
                        <div className="card-section">
                            <div className="block block-empty text-center">
                                {(product.allowed || fundProvider.allow_products) && (
                                    <div className="empty-details">
                                        Er zijn momenteel geen beperkingen op het aanbod ingesteld.
                                    </div>
                                )}

                                {!product.allowed && !fundProvider.allow_products && (
                                    <div className="empty-details">
                                        <div className="empty-details">Het aanbod is nog niet goedgekeurd</div>
                                    </div>
                                )}

                                <div className="empty-actions">
                                    <button className="button button-primary" onClick={() => setShowEditor(true)}>
                                        <em className="mdi mdi-cog-outline icon-start" />
                                        {fundProvider.allow_products || product.allowed
                                            ? 'Stel een limiet in'
                                            : 'Aanbod goedkeuren met ingesteld limit'}
                                    </button>

                                    {product.deals_history.length > 0 && (
                                        <button
                                            className="button button-default"
                                            onClick={() => setShowHistory(!showHistory)}>
                                            <em className="mdi mdi-clipboard-text-clock-outline icon-start" />
                                            {showHistory ? 'Toon geschiedenis' : 'Verbeg geschiedenis'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

            {activeOrganization.allow_budget_fund_limits && fund.type == 'budget' && (deal || showEditor) && (
                <FundProviderProductEditor
                    fundProvider={fundProvider}
                    product={product}
                    fund={fund}
                    deal={deal}
                    onCancel={() => onCancel()}
                    onUpdate={(data) => onUpdate(data)}
                    onReset={(deal) => resetLimits(deal)}
                />
            )}

            {!deal &&
                product.deals_history.length > 0 &&
                (fund.type == 'subsidies' || showHistory || product.hasLimits) && (
                    <div className="card">
                        <div className="card-header">
                            <div className="card-title">
                                <div className="ellipsis">{`Lopende en verlopen acties op ${product.name}`}</div>
                            </div>
                        </div>
                        <div className="card-section card-section-padless">
                            <div className="table-wrapper">
                                <table className="table">
                                    <tbody>
                                        <tr>
                                            <th className="td-narrow">Gebruikt</th>
                                            <th className="td-narrow">Gereserveerd</th>
                                            <th>
                                                <div className="flex flex-horizontal">
                                                    <div className="flex">Totaal aantal aanbiedingen</div>
                                                    <div className="flex">
                                                        <Tooltip text="Totaal aantal aanbiedingen waaraan uw organisatie wilt bijdragen" />
                                                    </div>
                                                </div>
                                            </th>
                                            <th>Limiet per aanvrager</th>
                                            {fund.type == 'subsidies' && <th>Bijdrage</th>}
                                            <th>Status</th>
                                            <th>Verloopdatum</th>
                                            <th className="text-right">Acties</th>
                                        </tr>

                                        {product.deals_history.map((item) => (
                                            <tr key={item.id}>
                                                <td>{item.voucher_transactions_count}</td>
                                                <td>{item.product_reservations_pending_count}</td>
                                                <td>
                                                    {item.limit_total_unlimited || item.limit_total === null
                                                        ? 'Onbeperkt'
                                                        : item.limit_total}
                                                </td>
                                                <td>
                                                    {item.limit_per_identity === null
                                                        ? 'Onbeperkt'
                                                        : item.limit_per_identity}
                                                </td>
                                                {fund.type == 'subsidies' && <td>{item.amount_locale}</td>}
                                                <td>
                                                    {item.expire_at_locale
                                                        ? item.expire_at_locale
                                                        : 'Verloopt met het fonds'}
                                                </td>
                                                <td>
                                                    {item.active ? (
                                                        <div className="tag tag-success">Actief</div>
                                                    ) : (
                                                        <div className="tag tag-default">Afgelopen</div>
                                                    )}
                                                </td>
                                                {!(fund.type == 'subsidies' || item.active) ? (
                                                    <td className="td-narrow">
                                                        <div className="text-right text-muted">-</div>
                                                    </td>
                                                ) : (
                                                    <td className="td-narrow">
                                                        <div className="button-group">
                                                            {fund.type == 'budget' && item.active && (
                                                                <Fragment>
                                                                    <button
                                                                        className="button button-default button-sm button-icon"
                                                                        type="button"
                                                                        onClick={() => setDeal(item)}>
                                                                        <em className="mdi mdi-cog-outline" />
                                                                    </button>

                                                                    <button
                                                                        className="button button-danger button-sm button-icon"
                                                                        type="button"
                                                                        onClick={() => resetLimits(item)}>
                                                                        <em className="mdi mdi-trash-can-outline" />
                                                                    </button>
                                                                </Fragment>
                                                            )}

                                                            {fund.type == 'subsidies' && (
                                                                <StateNavLink
                                                                    name="fund-provider-product-subsidy-edit"
                                                                    params={{
                                                                        id: product.id,
                                                                        fundId: fundProvider.fund_id,
                                                                        fundProviderId: fundProvider.id,
                                                                        organizationId: activeOrganization.id,
                                                                    }}
                                                                    query={{ deal_id: item.id }}
                                                                    className="button button-default button-sm">
                                                                    <em className="mdi mdi-eye-outline icon-start" />
                                                                    Bekijk
                                                                </StateNavLink>
                                                            )}
                                                        </div>
                                                    </td>
                                                )}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
        </Fragment>
    );
}
