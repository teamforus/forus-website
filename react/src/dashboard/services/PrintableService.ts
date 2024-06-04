import { useState } from 'react';

export class PrintableService {
    private printables = {
        list: [],
    };
    private printableKeys = Object.keys([]);

    private printableKeyExists = (key) => {
        return this.printableKeys.indexOf(key) !== -1;
    };

    public open = (key: string, scope: object, events = {}) => {
        if (!this.printableKeyExists(key)) {
            throw new Error(`Unknown printable key "${key}".`);
        }

        window.setTimeout(() => {
            this.printables.list.push({
                key: key,
                scope: scope,
                events: typeof events == 'object' ? events : {},
            });
        }, 0);
    };

    public close = (printable) => {
        if (this.printables.list.indexOf(printable) !== -1) {
            this.printables.list.splice(this.printables.list.indexOf(printable), 1);
        }
    };

    public getPrintables = () => {
        return this.printables.list;
    };
}
export function usePrintableService(): PrintableService {
    return useState(new PrintableService())[0];
}
