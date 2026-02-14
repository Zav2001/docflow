import { StorageService } from '../services/storage';
import type { NotificationItem, User } from '../types';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const userApi = {
    login: async (email: string, password: string): Promise<User> => {
        await sleep(300);
        const found = StorageService.findUserByEmail(email);
        if (!found || found.password !== password) {
            throw new Error('Invalid email or password');
        }
        const user: User = {
            id: found.id,
            name: found.name,
            role: found.role,
            email: found.email,
            preferences: found.preferences,
            lastPasswordChangedAt: found.lastPasswordChangedAt,
        };
        StorageService.setCurrentUser(user);
        StorageService.createSession(user.id, 'Web Browser');
        StorageService.addAuditLog({
            type: 'auth',
            actor: user.name,
            action: 'signed in',
            target: user.email,
        });
        return user;
    },

    register: async (payload: { name: string; email: string; password: string }): Promise<User> => {
        await sleep(400);
        const created = StorageService.createUser(payload);
        StorageService.createSession(created.id, 'Web Browser');
        StorageService.addAuditLog({
            type: 'auth',
            actor: created.name,
            action: 'registered account',
            target: created.email,
        });
        return {
            id: created.id,
            name: created.name,
            role: created.role,
            email: created.email,
            preferences: created.preferences,
            lastPasswordChangedAt: created.lastPasswordChangedAt,
        };
    },

    logout: async (): Promise<void> => {
        await sleep(150);
        const current = StorageService.getCurrentUser();
        if (current) {
            StorageService.addAuditLog({
                type: 'auth',
                actor: current.name,
                action: 'signed out',
                target: current.email,
            });
        }
        StorageService.clearCurrentSession();
        StorageService.setCurrentUser(null);
    },

    getCurrentUser: async (): Promise<User | null> => {
        await sleep(200);
        return StorageService.getCurrentUser();
    },

    updateProfile: async (user: User): Promise<User> => {
        await sleep(500);
        const saved = StorageService.updateUser(user);
        StorageService.addAuditLog({
            type: 'profile_update',
            actor: saved.name,
            action: 'updated profile',
            target: saved.email,
        });
        return saved;
    },

    updatePreferences: async (preferences: NonNullable<User['preferences']>): Promise<User> => {
        await sleep(300);
        const current = StorageService.getCurrentUser();
        if (!current) {
            throw new Error('No active user');
        }
        const saved = StorageService.updateUser({ ...current, preferences });
        StorageService.addAuditLog({
            type: 'profile_update',
            actor: saved.name,
            action: 'updated preferences',
            target: saved.email,
        });
        return saved;
    },

    changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
        await sleep(400);
        const current = StorageService.getCurrentUser();
        if (!current) {
            throw new Error('No active user');
        }
        StorageService.updatePassword(current.id, currentPassword, newPassword);
        StorageService.addAuditLog({
            type: 'profile_update',
            actor: current.name,
            action: 'changed password',
            target: current.email,
        });
    },

    getActiveSessions: async (): Promise<Array<{ id: string; userId: string; label: string; createdAt: string; current: boolean }>> => {
        await sleep(200);
        const current = StorageService.getCurrentUser();
        if (!current) return [];
        return StorageService.getSessions().filter((s) => s.userId === current.id);
    },

    signOutOtherSessions: async (): Promise<void> => {
        await sleep(220);
        const current = StorageService.getCurrentUser();
        if (!current) return;
        StorageService.removeOtherSessions(current.id);
        StorageService.addAuditLog({
            type: 'auth',
            actor: current.name,
            action: 'signed out other sessions',
            target: current.email,
        });
    },

    getTeam: async (): Promise<any[]> => {
        await sleep(400);
        return StorageService.getTeam();
    },

    inviteMember: async (email: string, role: string): Promise<any> => {
        await sleep(600);
        const newMember = {
            id: `user-${Date.now()}`,
            name: email.split('@')[0], // Mock name from email
            role: role,
            avatar: email[0].toUpperCase() + email[1].toUpperCase(),
            status: 'offline',
            documents: 0,
            email: email
        };
        StorageService.addTeamMember(newMember);
        StorageService.addNotification({
            type: 'system',
            title: 'Team member invited',
            message: `${email} was invited as ${role}`,
            read: false,
        });
        StorageService.addAuditLog({
            type: 'system',
            actor: 'Current User',
            action: 'invited team member',
            target: email,
        });
        return newMember;
    },

    removeMember: async (id: string): Promise<void> => {
        await sleep(400);
        const member = StorageService.getTeam().find((m) => m.id === id);
        StorageService.removeTeamMember(id);
        if (member) {
            StorageService.addNotification({
                type: 'system',
                title: 'Team member removed',
                message: `${member.name} was removed from workspace`,
                read: false,
            });
            StorageService.addAuditLog({
                type: 'system',
                actor: 'Current User',
                action: 'removed team member',
                target: member.name,
            });
        }
    },

    getNotifications: async (): Promise<NotificationItem[]> => {
        await sleep(300);
        return StorageService.getNotifications();
    },

    getUnreadNotificationsCount: async (): Promise<number> => {
        await sleep(120);
        return StorageService.getNotifications().filter((n) => !n.read).length;
    },

    markAsRead: async (id: string | number): Promise<void> => {
        await sleep(200);
        const notifications = StorageService.getNotifications();
        const notif = notifications.find((n) => n.id == String(id));
        if (notif) {
            notif.read = true;
            StorageService.updateNotifications(notifications);
        }
    },

    markAllAsRead: async (): Promise<void> => {
        await sleep(400);
        const notifications = StorageService.getNotifications();
        notifications.forEach((n) => n.read = true);
        StorageService.updateNotifications(notifications);
    },

    pushNotification: async (notification: Omit<NotificationItem, 'id' | 'createdAt' | 'time'>): Promise<NotificationItem> => {
        await sleep(120);
        const created = StorageService.addNotification(notification);
        StorageService.addAuditLog({
            type: 'notification',
            actor: 'System',
            action: 'created notification',
            target: created.title,
        });
        return created;
    },

    getAuditLogs: async () => {
        await sleep(200);
        return StorageService.getAuditLogs();
    },
};
