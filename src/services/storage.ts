import type { DocumentMetadata, User, Annotation, ExtractedField, NotificationItem, AuditLogItem, DocumentVersion } from '../types';

export const STORAGE_KEYS = {
    DOCUMENTS: 'docflow_documents',
    DOCUMENTS_JSON_SNAPSHOT: 'docflow_documents_json_snapshot',
    USERS: 'docflow_users',
    CURRENT_USER: 'docflow_current_user',
    TEAM: 'docflow_team',
    NOTIFICATIONS: 'docflow_notifications',
    EXTRACTED_FIELDS: 'docflow_extracted_fields',
    ANNOTATIONS: 'docflow_annotations',
    COMMENTS: 'docflow_comments',
    ANALYTICS: 'docflow_analytics',
    SESSIONS: 'docflow_sessions',
    AUDIT_LOGS: 'docflow_audit_logs',
    DOCUMENT_VERSIONS: 'docflow_document_versions',
};

// Initial data loader
const loadInitialData = async <T>(key: string, url: string): Promise<T> => {
    const stored = localStorage.getItem(key);
    if (stored) {
        return JSON.parse(stored);
    }
    const response = await fetch(url);
    const data = await response.json();
    localStorage.setItem(key, JSON.stringify(data));
    return data;
};

export const StorageService = {
    syncDocumentsSnapshot: () => {
        const docs = StorageService.getDocuments();
        // Keep snapshot lightweight to avoid localStorage quota issues.
        // Full PDF data URLs stay in DOCUMENTS; snapshot is metadata-only.
        const lightweight = docs.map((doc) => ({
            id: doc.id,
            name: doc.name,
            uploadDate: doc.uploadDate,
            status: doc.status,
            totalPages: doc.totalPages,
            isFavorite: doc.isFavorite || false,
        }));

        try {
            StorageService.setItem(STORAGE_KEYS.DOCUMENTS_JSON_SNAPSHOT, lightweight);
        } catch (error) {
            // If quota is hit, keep app functional by trimming snapshot payload.
            const trimmed = lightweight.slice(-25);
            try {
                StorageService.setItem(STORAGE_KEYS.DOCUMENTS_JSON_SNAPSHOT, trimmed);
            } catch {
                // Final fallback: clear snapshot key only.
                localStorage.removeItem(STORAGE_KEYS.DOCUMENTS_JSON_SNAPSHOT);
            }
            console.warn('Document snapshot storage exceeded quota. Saved trimmed snapshot instead.', error);
        }
    },

    // Initialization
    initialize: async () => {
        await Promise.all([
            loadInitialData(STORAGE_KEYS.DOCUMENTS, '/data/documents.json'),
            loadInitialData(STORAGE_KEYS.USERS, '/data/users.json'),
            loadInitialData(STORAGE_KEYS.TEAM, '/data/team.json'),
            loadInitialData(STORAGE_KEYS.NOTIFICATIONS, '/data/notifications.json'),
            loadInitialData(STORAGE_KEYS.EXTRACTED_FIELDS, '/data/extracted-fields.json'),
            loadInitialData(STORAGE_KEYS.ANNOTATIONS, '/data/annotations.json'),
            loadInitialData(STORAGE_KEYS.COMMENTS, '/data/comments.json'),
            loadInitialData(STORAGE_KEYS.ANALYTICS, '/data/analytics.json'),
        ]);

        // Ensure seed users have a password for local auth flows.
        const users = StorageService.getUsers();
        const normalized = users.map((user) => ({
            ...user,
            password: user.password || 'admin123',
            preferences: user.preferences || {
                emailNotifications: true,
                pushNotifications: true,
                weeklyDigest: true,
                twoFactorEnabled: false,
                mutedNotificationTypes: [],
                digestMode: 'instant',
            },
        }));
        StorageService.saveUsers(normalized);
        StorageService.syncDocumentsSnapshot();
    },

    // Generic Getters
    getItem: <T>(key: string): T | null => {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    },

    setItem: <T>(key: string, value: T) => {
        localStorage.setItem(key, JSON.stringify(value));
    },

    // Documents
    getDocuments: (): DocumentMetadata[] => {
        return StorageService.getItem<DocumentMetadata[]>(STORAGE_KEYS.DOCUMENTS) || [];
    },

    saveDocument: (doc: DocumentMetadata) => {
        const docs = StorageService.getDocuments();
        const existingIndex = docs.findIndex(d => d.id === doc.id);
        if (existingIndex >= 0) {
            docs[existingIndex] = doc;
        } else {
            docs.push(doc);
        }
        StorageService.setItem(STORAGE_KEYS.DOCUMENTS, docs);
        StorageService.syncDocumentsSnapshot();
        return doc;
    },

    deleteDocument: (id: string) => {
        const docs = StorageService.getDocuments().filter(d => d.id !== id);
        StorageService.setItem(STORAGE_KEYS.DOCUMENTS, docs);
        StorageService.syncDocumentsSnapshot();
    },

    // Users
    getUsers: (): (User & { password: string })[] => {
        return StorageService.getItem<(User & { password: string })[]>(STORAGE_KEYS.USERS) || [];
    },

    saveUsers: (users: (User & { password: string })[]) => {
        StorageService.setItem(STORAGE_KEYS.USERS, users);
    },

    findUserByEmail: (email: string): (User & { password: string }) | null => {
        const users = StorageService.getUsers();
        return users.find(u => (u.email || '').toLowerCase() === email.toLowerCase()) || null;
    },

    createUser: (payload: { name: string; email: string; password: string; role?: User['role'] }) => {
        const users = StorageService.getUsers();
        const existing = users.find(u => (u.email || '').toLowerCase() === payload.email.toLowerCase());
        if (existing) {
            throw new Error('Email already registered');
        }

        const user: User & { password: string } = {
            id: `user-${Date.now()}`,
            name: payload.name,
            email: payload.email,
            role: payload.role || 'REVIEWER',
            password: payload.password,
            preferences: {
                emailNotifications: true,
                pushNotifications: true,
                weeklyDigest: true,
                twoFactorEnabled: false,
                mutedNotificationTypes: [],
                digestMode: 'instant',
            },
        };

        users.push(user);
        StorageService.saveUsers(users);
        StorageService.setItem(STORAGE_KEYS.CURRENT_USER, {
            id: user.id,
            name: user.name,
            role: user.role,
            email: user.email,
            preferences: user.preferences,
            lastPasswordChangedAt: user.lastPasswordChangedAt,
        });
        return user;
    },

    setCurrentUser: (user: User | null) => {
        if (!user) {
            localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
            return;
        }
        StorageService.setItem(STORAGE_KEYS.CURRENT_USER, user);
    },

    getCurrentUser: (): User | null => {
        return StorageService.getItem<User>(STORAGE_KEYS.CURRENT_USER);
    },

    updateUser: (user: User) => {
        StorageService.setItem(STORAGE_KEYS.CURRENT_USER, user);
        // Also update in users list
        const users = StorageService.getUsers();
        const index = users.findIndex(u => u.id === user.id);
        if (index >= 0) {
            users[index] = { ...users[index], ...user };
            StorageService.saveUsers(users);
        }
        return user;
    },

    updatePassword: (userId: string, currentPassword: string, nextPassword: string) => {
        const users = StorageService.getUsers();
        const index = users.findIndex((u) => u.id === userId);
        if (index < 0) {
            throw new Error('User not found');
        }
        if (users[index].password !== currentPassword) {
            throw new Error('Current password is incorrect');
        }
        users[index].password = nextPassword;
        users[index].lastPasswordChangedAt = new Date().toISOString();
        StorageService.saveUsers(users);

        const current = StorageService.getCurrentUser();
        if (current?.id === userId) {
            StorageService.setCurrentUser({
                ...current,
                lastPasswordChangedAt: users[index].lastPasswordChangedAt,
            });
        }
    },

    getSessions: (): Array<{ id: string; userId: string; label: string; createdAt: string; current: boolean }> => {
        return StorageService.getItem<Array<{ id: string; userId: string; label: string; createdAt: string; current: boolean }>>(STORAGE_KEYS.SESSIONS) || [];
    },

    createSession: (userId: string, label: string) => {
        const sessions = StorageService.getSessions().map((s) => ({ ...s, current: false }));
        const session = {
            id: `sess-${Date.now()}`,
            userId,
            label,
            createdAt: new Date().toISOString(),
            current: true,
        };
        sessions.unshift(session);
        StorageService.setItem(STORAGE_KEYS.SESSIONS, sessions);
        return session;
    },

    removeOtherSessions: (userId: string) => {
        const sessions = StorageService.getSessions().filter((s) => s.userId !== userId || s.current);
        StorageService.setItem(STORAGE_KEYS.SESSIONS, sessions);
    },

    clearCurrentSession: () => {
        const sessions = StorageService.getSessions().map((s) => (s.current ? { ...s, current: false } : s));
        StorageService.setItem(STORAGE_KEYS.SESSIONS, sessions);
    },

    // Team
    getTeam: (): any[] => {
        return StorageService.getItem<any[]>(STORAGE_KEYS.TEAM) || [];
    },

    addTeamMember: (member: any) => {
        const team = StorageService.getTeam();
        team.push(member);
        StorageService.setItem(STORAGE_KEYS.TEAM, team);
        return member;
    },

    removeTeamMember: (id: string) => {
        const team = StorageService.getTeam().filter(m => m.id !== id);
        StorageService.setItem(STORAGE_KEYS.TEAM, team);
    },

    // Notifications
    getNotifications: (): NotificationItem[] => {
        return StorageService.getItem<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS) || [];
    },

    updateNotifications: (notifications: NotificationItem[]) => {
        StorageService.setItem(STORAGE_KEYS.NOTIFICATIONS, notifications);
    },

    addNotification: (notification: Omit<NotificationItem, 'id' | 'createdAt' | 'time'>) => {
        const now = new Date();
        const item: NotificationItem = {
            id: `notif-${Date.now()}`,
            createdAt: now.toISOString(),
            time: 'Just now',
            ...notification,
        };
        const notifications = StorageService.getNotifications();
        notifications.unshift(item);
        StorageService.updateNotifications(notifications);
        return item;
    },

    // Audit logs
    getAuditLogs: (): AuditLogItem[] => {
        return StorageService.getItem<AuditLogItem[]>(STORAGE_KEYS.AUDIT_LOGS) || [];
    },

    addAuditLog: (log: Omit<AuditLogItem, 'id' | 'createdAt'>) => {
        const item: AuditLogItem = {
            id: `audit-${Date.now()}`,
            createdAt: new Date().toISOString(),
            ...log,
        };
        const logs = StorageService.getAuditLogs();
        logs.unshift(item);
        StorageService.setItem(STORAGE_KEYS.AUDIT_LOGS, logs);
        return item;
    },

    // Document versions
    getDocumentVersions: (documentId: string): DocumentVersion[] => {
        const all = StorageService.getItem<Record<string, DocumentVersion[]>>(STORAGE_KEYS.DOCUMENT_VERSIONS) || {};
        return all[documentId] || [];
    },

    addDocumentVersion: (document: DocumentMetadata) => {
        const all = StorageService.getItem<Record<string, DocumentVersion[]>>(STORAGE_KEYS.DOCUMENT_VERSIONS) || {};
        const current = all[document.id] || [];
        const version: DocumentVersion = {
            id: `ver-${Date.now()}`,
            documentId: document.id,
            name: document.name,
            status: document.status,
            createdAt: new Date().toISOString(),
        };
        all[document.id] = [version, ...current];
        StorageService.setItem(STORAGE_KEYS.DOCUMENT_VERSIONS, all);
        return version;
    },

    // Extracted Fields
    getExtractedFields: (documentId: string): ExtractedField[] => {
        const allFields = StorageService.getItem<Record<string, ExtractedField[]>>(STORAGE_KEYS.EXTRACTED_FIELDS) || {};
        return allFields[documentId] || [];
    },

    saveExtractedFields: (documentId: string, fields: ExtractedField[]) => {
        const allFields = StorageService.getItem<Record<string, ExtractedField[]>>(STORAGE_KEYS.EXTRACTED_FIELDS) || {};
        allFields[documentId] = fields;
        StorageService.setItem(STORAGE_KEYS.EXTRACTED_FIELDS, allFields);
    },

    // Annotations
    getAnnotations: (documentId: string): Annotation[] => {
        const allAnnotations = StorageService.getItem<Annotation[]>(STORAGE_KEYS.ANNOTATIONS) || [];
        return allAnnotations.filter(a => a.documentId === documentId);
    },

    saveAnnotation: (annotation: Annotation) => {
        let allAnnotations = StorageService.getItem<Annotation[]>(STORAGE_KEYS.ANNOTATIONS) || [];
        // Check if exists
        const index = allAnnotations.findIndex(a => a.id === annotation.id);
        if (index >= 0) {
            allAnnotations[index] = annotation;
        } else {
            allAnnotations.push(annotation);
        }
        StorageService.setItem(STORAGE_KEYS.ANNOTATIONS, allAnnotations);
        return annotation;
    },

    deleteAnnotation: (id: string) => {
        const allAnnotations = StorageService.getItem<Annotation[]>(STORAGE_KEYS.ANNOTATIONS) || [];
        StorageService.setItem(
            STORAGE_KEYS.ANNOTATIONS,
            allAnnotations.filter((annotation) => annotation.id !== id)
        );
    },

    // Comments
    getComments: (): any[] => {
        return StorageService.getItem<any[]>(STORAGE_KEYS.COMMENTS) || [];
    },

    getCommentsByDocument: (documentId: string): any[] => {
        return StorageService.getComments().filter((comment) => comment.documentId === documentId);
    },

    saveComment: (comment: any) => {
        const comments = StorageService.getComments();
        const index = comments.findIndex((c) => c.id === comment.id);
        if (index >= 0) {
            comments[index] = comment;
        } else {
            comments.push(comment);
        }
        StorageService.setItem(STORAGE_KEYS.COMMENTS, comments);
        return comment;
    },

    deleteComment: (id: string) => {
        const comments = StorageService.getComments().filter((comment) => comment.id !== id);
        StorageService.setItem(STORAGE_KEYS.COMMENTS, comments);
    },

    toggleResolveComment: (id: string) => {
        const comments = StorageService.getComments();
        const index = comments.findIndex((comment) => comment.id === id);
        if (index >= 0) {
            comments[index] = { ...comments[index], resolved: !comments[index].resolved };
            StorageService.setItem(STORAGE_KEYS.COMMENTS, comments);
            return comments[index];
        }
        return null;
    }
};
