import type { UserRole } from '../types';

export type AppPermission =
    | 'documents:view'
    | 'documents:upload'
    | 'documents:approve'
    | 'team:view'
    | 'team:manage'
    | 'analytics:view'
    | 'settings:manage'
    | 'notifications:view';

const ROLE_PERMISSIONS: Record<UserRole, AppPermission[]> = {
    ADMIN: [
        'documents:view',
        'documents:upload',
        'documents:approve',
        'team:view',
        'team:manage',
        'analytics:view',
        'settings:manage',
        'notifications:view',
    ],
    REVIEWER: [
        'documents:view',
        'documents:upload',
        'team:view',
        'settings:manage',
        'notifications:view',
    ],
};

export const hasPermission = (role: UserRole | undefined, permission: AppPermission): boolean => {
    if (!role) return false;
    return ROLE_PERMISSIONS[role].includes(permission);
};
