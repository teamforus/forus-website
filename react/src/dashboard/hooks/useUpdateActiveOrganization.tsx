import { useCallback, useContext } from 'react';
import { mainContext } from '../contexts/MainContext';
import useActiveOrganization from './useActiveOrganization';
import Organization from '../props/models/Organization';

export default function useUpdateActiveOrganization() {
    const activeOrganization = useActiveOrganization();
    const { setActiveOrganization } = useContext(mainContext);

    return useCallback(
        function (organization: Organization) {
            setActiveOrganization(Object.assign(activeOrganization, organization));
        },
        [activeOrganization, setActiveOrganization],
    );
}
