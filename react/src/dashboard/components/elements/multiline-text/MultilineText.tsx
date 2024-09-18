import React, { Fragment } from 'react';

export default function MultilineText({ text }: { text: string }) {
    return text?.split('\n')?.map((line: string, index: number) => (
        <Fragment key={index}>
            {line.trim() !== '' ? (
                <Fragment>
                    {line}
                    <br />
                </Fragment>
            ) : (
                <br />
            )}
        </Fragment>
    ));
}
