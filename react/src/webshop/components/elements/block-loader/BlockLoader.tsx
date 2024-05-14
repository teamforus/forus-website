import React from 'react';

export default function BlockLoader({ type }: { type?: 'full' }) {
    return (
        <div className={`block block-loader ${type == 'full' ? 'block-loader-full' : ''}`}>
            <div className="loader-content">
                <div className={'loader-bars'}>
                    <div className={'loader-bar'} />
                    <div className={'loader-bar'} />
                    <div className={'loader-bar'} />
                </div>
            </div>
        </div>
    );
}
