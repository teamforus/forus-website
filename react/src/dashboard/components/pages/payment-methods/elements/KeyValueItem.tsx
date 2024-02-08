import React from 'react';

export default function KeyValueItem({ label, value }: { label: string; value?: string | number }) {
    return (
        <div className="keyvalue-item">
            <div className="keyvalue-key">{label}</div>
            <div className={(value ? '' : 'text-muted') + ' keyvalue-value'}>{value || '-'}</div>
        </div>
    );
}
