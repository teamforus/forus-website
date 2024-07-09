import ApiRequestService from './ApiRequestService';
import Identity from '../props/models/Identity';
import { useState } from 'react';
import TurnDownService from 'turndown';
import * as turnDownPluginGfm from 'turndown-plugin-gfm';
import { ResponseSimple } from '../props/ApiResponses';

export class MarkdownService<T = { data: Identity }> {
    /**
     * Url prefix
     *
     * @param data
     */
    public prefix = '/platform';

    /**
     * @param apiRequest
     */
    public constructor(protected apiRequest: ApiRequestService<T> = new ApiRequestService<T>()) {}

    private nodeContainsTable(node: HTMLElement | ChildNode) {
        if (!node.childNodes) return false;

        for (let i = 0; i < node.childNodes.length; i++) {
            const child = node.childNodes[i];
            if (child.nodeName === 'TABLE') return true;
            if (this.nodeContainsTable(child)) return true;
        }
        return false;
    }

    private tableShouldBeSkipped(tableNode: HTMLTableElement) {
        if (!tableNode) return true;
        if (!tableNode.rows) return true;
        if (tableNode.rows.length === 1 && tableNode.rows[0].childNodes.length <= 1) return true; // Table with only one cell
        return this.nodeContainsTable(tableNode);
    }

    private tableColCount(node: HTMLTableElement) {
        let maxColCount = 0;
        for (let i = 0; i < node.rows.length; i++) {
            const row = node.rows[i];
            const colCount = row.childNodes.length;
            if (colCount > maxColCount) maxColCount = colCount;
        }
        return maxColCount;
    }

    public getTurnDownService() {
        const turnDownService = new TurnDownService({ headingStyle: 'atx' });

        turnDownService.addRule('strikethrough', {
            filter: (node) => {
                return (
                    node.className === 'youtube-root' &&
                    node.children.length > 0 &&
                    node.children[0].tagName.toLowerCase() === 'iframe'
                );
            },
            replacement: function () {
                // eslint-disable-next-line prefer-rest-params
                return `[](${arguments[1].children[0].src.replace(
                    'https://www.youtube.com/embed/',
                    'https://www.youtube.com/watch?v=',
                )})`;
            },
        });

        turnDownService.addRule('tables', {
            filter: (node) => {
                return node.nodeName === 'TABLE';
            },
            replacement: (content: string, node: HTMLTableElement) => {
                if (this.tableShouldBeSkipped(node)) return content;

                // Ensure there are no blank lines
                content = content.replace(/\n+/g, '\n');

                // If table has no heading, add an empty one to get a valid Markdown table
                const lines = content.trim().split('\n');
                let secondLine = '';
                if (lines.length >= 2) secondLine = lines[1];
                const secondLineIsDivider = secondLine.indexOf('| ---') === 0;

                const columnCount = this.tableColCount(node);
                let emptyHeader = '';
                if (columnCount && !secondLineIsDivider) {
                    emptyHeader = '|' + '     |'.repeat(columnCount) + '\n' + '|' + ' --- |'.repeat(columnCount);
                }

                return '\n\n' + emptyHeader + content + '\n\n';
            },
        });

        turnDownService.use(turnDownPluginGfm.gfm);

        return turnDownService;
    }

    public toMarkdown(content_html: string) {
        const turnDownService = this.getTurnDownService();
        const markdown = turnDownService.turndown(content_html).split('\n');

        return markdown
            .map((line, index) => {
                return index != 0 && markdown[index - 1] === '' && line.trim() === '' ? '&nbsp;  ' : line;
            })
            .join('\n');
    }

    public toHtml(markdown: string): Promise<ResponseSimple<{ html: string }>> {
        return this.apiRequest.post(`${this.prefix}/format`, { markdown });
    }
}

export function useMarkdownService(): MarkdownService {
    return useState(new MarkdownService())[0];
}
