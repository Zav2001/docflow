export type UserRole = 'ADMIN' | 'REVIEWER';

export interface User {
    id: string;
    name: string;
    role: UserRole;
    email?: string;
    preferences?: {
        emailNotifications: boolean;
        pushNotifications: boolean;
        weeklyDigest: boolean;
        twoFactorEnabled: boolean;
        mutedNotificationTypes?: NotificationItem['type'][];
        digestMode?: 'instant' | 'daily' | 'weekly';
    };
    lastPasswordChangedAt?: string;
}

export interface NotificationItem {
    id: string;
    type: 'document' | 'comment' | 'approval' | 'mention' | 'system';
    title: string;
    message: string;
    time: string;
    read: boolean;
    createdAt: string;
}

export interface AuditLogItem {
    id: string;
    type: 'upload' | 'approval' | 'delete' | 'profile_update' | 'notification' | 'auth' | 'system';
    actor: string;
    action: string;
    target?: string;
    createdAt: string;
    metadata?: Record<string, string>;
}

export interface DocumentVersion {
    id: string;
    documentId: string;
    name: string;
    status: DocumentMetadata['status'];
    createdAt: string;
}

export interface CommentItem {
    id: string;
    annotationId: string;
    documentId: string;
    authorId: string;
    authorName: string;
    content: string;
    mentions: string[];
    createdAt: string;
    updatedAt?: string;
    parentId?: string;
    resolved: boolean;
}

export interface DocumentMetadata {
    id: string;
    name: string;
    uploadDate: string;
    status: 'PENDING' | 'REVIEWED' | 'APPROVED';
    thumbnailUrl?: string;
    pdfUrl: string;
    totalPages: number;
    isFavorite?: boolean;
}

export interface Annotation {
    id: string;
    documentId: string;
    pageNumber: number;
    type: 'HIGHLIGHT' | 'COMMENT' | 'RECTANGLE' | 'ARROW';
    content?: string;
    position: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    points?: { x: number; y: number }[];
    color?: 'yellow' | 'green' | 'blue' | 'red' | 'purple';
    authorId: string;
    createdAt: string;
}

export interface ExtractedField {
    id: string;
    label: string;
    value: string;
    confidence: number;
    pageIndex: number;
    fieldType: 'TEXT' | 'DATE' | 'CURRENCY' | 'ID';
}
