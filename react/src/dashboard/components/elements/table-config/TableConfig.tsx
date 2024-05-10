import React from 'react';
import { useTranslation } from 'react-i18next';

export default function TableConfig({
    selectedCategory,
    tooltips,
    activeTooltipKey,
    setSelectedCategory,
    onClose,
}: {
    selectedCategory: string;
    tooltips: Array<{ key: string; title: string; description: string }>;
    setSelectedCategory: (category: string) => void;
    activeTooltipKey: string;
    onClose?: () => void;
}) {
    const { t } = useTranslation();

    return (
        <div className={`block block-table-settings`}>
            <div className="table-settings-close" onClick={onClose}>
                <em className="mdi mdi-close" />
            </div>

            <div className="table-settings-list">
                <div
                    className={`table-setting ${selectedCategory == 'tooltips' ? 'active' : ''} ${
                        !tooltips.length ? 'disabled' : ''
                    }`}
                    onClick={() => setSelectedCategory('tooltips')}>
                    <em className="mdi mdi-information-variant-circle" />
                    <div className="table-setting-name">Kolombeschrijvingen</div>
                </div>
            </div>

            <div className="table-settings-details-block">
                {selectedCategory == 'tooltips' && (
                    <div className="table-settings-tooltip-list">
                        {tooltips.map((tooltip, index) => (
                            <div
                                className={`table-settings-tooltip-item ${
                                    tooltip.key == activeTooltipKey ? 'active' : ''
                                }`}
                                key={index}>
                                <div className="table-settings-tooltip-item-title">{tooltip.title}</div>
                                <div
                                    className="table-settings-tooltip-item-description"
                                    dangerouslySetInnerHTML={{ __html: t(tooltip.description) }}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
