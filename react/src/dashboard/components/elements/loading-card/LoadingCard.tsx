import React, { Fragment } from 'react';

export default function LoadingCard({ type = 'card' }: { type?: 'card' | 'section-card' }) {
    return React.createElement(
        type == 'card' ? 'div' : Fragment,
        type == 'card' ? { className: 'card' } : {},
        <div className="card-section">
            <div className="card-loading">
                <em className="mdi mdi-loading mdi-spin" />
            </div>
        </div>,
    );
}
