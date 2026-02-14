import React, { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { useAppSelector } from './useRedux';
import type { AppPermission } from '../auth/permissions';
import { hasPermission } from '../auth/permissions';

interface RoleContextType {
    isAdmin: boolean;
    isViewer: boolean;
    can: (permission: AppPermission) => boolean;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const RoleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const currentUser = useAppSelector((state) => state.session.currentUser);
    const isAdmin = currentUser?.role === 'ADMIN';
    const isViewer = currentUser?.role === 'REVIEWER';
    const can = (permission: AppPermission) => hasPermission(currentUser?.role, permission);

    return (
        <RoleContext.Provider value={{ isAdmin, isViewer, can }}>
            {children}
        </RoleContext.Provider>
    );
};

export const useRole = () => {
    const context = useContext(RoleContext);
    if (!context) {
        throw new Error('useRole must be used within a RoleProvider');
    }
    return context;
};
