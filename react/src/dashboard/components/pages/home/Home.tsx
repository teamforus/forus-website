import React from 'react';
import EnvDataProp from '../../../../props/EnvData';

export const Home = ({ envData }: { envData: EnvDataProp }) => {
    return (
        <div className="wrapper">
            <h2>
                Welcome to <strong>{envData.name}</strong>!
            </h2>
            <p>
                Lorem ipsum dolor sit, amet consectetur adipisicing elit. Neque facere nostrum quo error quod
                perspiciatis nihil placeat asperiores unde aliquid blanditiis, ipsum quidem maiores, sed ducimus
                deleniti alias porro eaque fuga deserunt.
            </p>
        </div>
    );
};
