import React, { useMemo } from 'react';

export default function TableDescription({
    description,
    lines = 2,
    lineSize = 32,
}: {
    description: string;
    lines?: number;
    lineSize?: number;
}) {
    const splitText = (text: string, lines: number, lineSize: number) => {
        const words = text.split(' ');
        const result = [];
        let currentLine = '';

        for (const word of words) {
            if ((currentLine + word).length <= lineSize) {
                currentLine += `${word} `;
            } else {
                result.push(currentLine.trim());
                currentLine = `${word} `;
            }
        }
        if (currentLine) {
            result.push(currentLine.trim());
        }

        if (result.length > lines) {
            result[lines - 1] += '...';
            return result.slice(0, lines);
        }

        return result;
    };

    const linesArray = useMemo(() => {
        return splitText(description || '', lines, lineSize);
    }, [description, lines, lineSize]);

    return (
        <div title={description}>
            {linesArray.map((line, index) => (
                <div key={index}>{line}</div>
            ))}
        </div>
    );
}
