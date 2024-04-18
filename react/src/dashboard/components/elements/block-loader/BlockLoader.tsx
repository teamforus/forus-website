import React from 'react';

// todo: implement loader
export default function BlockLoader() {
    return (
        <div
            style={{
                width: '100%',
                height: '200px',
                background: 'red',
                alignItems: 'center',
                fontFamily: 'sans-serif',
                backgroundColor: 'white',
                color: 'darkgray',
                gap: '6px',
                fontStyle: '12px',
                borderRadius: 'var(--border-radius)',
                marginBottom: '20px',
            }}
            className={'flex flex-vertical flex-center flex-align-items-center' + ''}
        />
    );
}
