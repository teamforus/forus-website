import React, { useState } from 'react';
import { createContext } from 'react';
import EnvDataBackend from '../../props/EnvDataBackend';

interface AuthMemoProps {
    envData?: EnvDataBackend;
    setEnvData?: React.Dispatch<React.SetStateAction<EnvDataBackend>>;
}

const mainContext = createContext<AuthMemoProps>(null);
const { Provider } = mainContext;

const MainProvider = ({ children }: { children: React.ReactElement }) => {
    const [envData, setEnvData] = useState<EnvDataBackend>(null);

    return (
        <Provider
            value={{
                envData,
                setEnvData,
            }}>
            {children}
        </Provider>
    );
};

export { MainProvider, mainContext };
