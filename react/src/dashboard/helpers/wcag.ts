import React from 'react';

export function clickOnKeyEnter(e: React.KeyboardEvent<HTMLElement>) {
    return e.key == 'Enter' ? e.currentTarget.click() : null;
}
