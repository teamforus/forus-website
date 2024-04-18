import React, { useEffect, useState } from 'react';
import { createContext } from 'react';
import { AppConfigProp, useConfigService } from '../../dashboard/services/ConfigService';
import EnvDataWebshopProp from '../../props/EnvDataWebshopProp';
import useFilter from '../../dashboard/hooks/useFilter';
import FilterScope from '../../dashboard/types/FilterScope';
import { useStateRoutes } from '../modules/state_router/Router';
import useTranslate from '../../dashboard/hooks/useTranslate';

interface AuthMemoProps {
    title: string;
    setTitle?: React.Dispatch<React.SetStateAction<string>>;
    envData?: EnvDataWebshopProp;
    setEnvData?: React.Dispatch<React.SetStateAction<EnvDataWebshopProp>>;
    appConfigs?: AppConfigProp;
    setAppConfigs?: React.Dispatch<React.SetStateAction<AppConfigProp>>;
    showSearchBox?: boolean;
    setShowSearchBox?: React.Dispatch<React.SetStateAction<boolean>>;
    mobileMenuOpened?: boolean;
    setMobileMenuOpened?: React.Dispatch<React.SetStateAction<boolean>>;
    userMenuOpened?: boolean;
    setUserMenuOpened?: React.Dispatch<React.SetStateAction<boolean>>;
    searchQuery?: string;
    setSearchQuery?: React.Dispatch<React.SetStateAction<string>>;
    searchFilter?: FilterScope<{ q: string }>;
}

const mainContext = createContext<AuthMemoProps>(null);
const { Provider } = mainContext;

const MainProvider = ({ children }: { children: React.ReactElement }) => {
    const [envData, setEnvData] = useState<EnvDataWebshopProp>(null);
    const [title, setTitle] = useState(null);
    const [appConfigs, setAppConfigs] = useState(null);
    const [showSearchBox, setShowSearchBox] = useState(false);
    const [mobileMenuOpened, setMobileMenuOpened] = useState(false);
    const [userMenuOpened, setUserMenuOpened] = useState(false);
    const { route } = useStateRoutes();

    const translate = useTranslate();
    const configService = useConfigService();

    const searchFilter = useFilter({
        q: '',
    });

    useEffect(() => {
        if (!envData?.type) {
            return;
        }

        configService.get(envData.type).then((res) => {
            setAppConfigs(res.data);
        });
    }, [configService, envData?.type]);

    useEffect(() => {
        setTitle(
            translate(
                `page_state_titles.${route.state.name}`,
                { implementation: appConfigs?.implementation_name },
                'page_title',
            ),
        );
    }, [route.pathname, route.state.name, translate, appConfigs]);

    useEffect(() => {
        document.title = title;
    }, [title]);

    return (
        <Provider
            value={{
                title,
                setTitle,
                envData,
                setEnvData,
                appConfigs,
                setAppConfigs,
                showSearchBox,
                setShowSearchBox,
                mobileMenuOpened,
                setMobileMenuOpened,
                userMenuOpened,
                setUserMenuOpened,
                searchFilter,
            }}>
            {children}
        </Provider>
    );
};

export { MainProvider, mainContext };
