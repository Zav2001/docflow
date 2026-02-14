import { StorageService } from '../services/storage';
import type { Annotation, CommentItem, DocumentMetadata, ExtractedField } from '../types';
import { pdfjs } from 'react-pdf';

// Simulate network latency
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const readFileAsDataUrl = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ''));
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
    });
const readFileAsArrayBuffer = (file: File): Promise<ArrayBuffer> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as ArrayBuffer);
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsArrayBuffer(file);
    });

export const docApi = {
    // Initialize data
    initialize: async () => {
        await StorageService.initialize();
    },

    getDocuments: async (): Promise<DocumentMetadata[]> => {
        await sleep(500);
        return StorageService.getDocuments();
    },

    getDocumentById: async (id: string): Promise<DocumentMetadata | undefined> => {
        await sleep(300);
        return StorageService.getDocuments().find(d => d.id === id);
    },

    saveDocument: async (doc: DocumentMetadata): Promise<DocumentMetadata> => {
        await sleep(500);
        StorageService.addDocumentVersion(doc);
        const saved = StorageService.saveDocument(doc);
        if (doc.status === 'APPROVED') {
            StorageService.addNotification({
                type: 'approval',
                title: 'Document approved',
                message: `${doc.name} has been approved`,
                read: false,
            });
            StorageService.addAuditLog({
                type: 'approval',
                actor: 'Current User',
                action: 'approved document',
                target: doc.name,
            });
        }
        return saved;
    },

    deleteDocument: async (id: string): Promise<void> => {
        await sleep(300);
        const doc = StorageService.getDocuments().find(d => d.id === id);
        StorageService.deleteDocument(id);
        if (doc) {
            StorageService.addNotification({
                type: 'system',
                title: 'Document deleted',
                message: `${doc.name} was removed from your workspace`,
                read: false,
            });
            StorageService.addAuditLog({
                type: 'delete',
                actor: 'Current User',
                action: 'deleted document',
                target: doc.name,
            });
        }
    },

    uploadDocument: async (file: File): Promise<DocumentMetadata> => {
        await sleep(1500); // Simulate upload
        const [pdfDataUrl, pdfBuffer] = await Promise.all([
            readFileAsDataUrl(file),
            readFileAsArrayBuffer(file),
        ]);
        let totalPages = 1;
        try {
            const loadingTask = pdfjs.getDocument({ data: pdfBuffer });
            const pdf = await loadingTask.promise;
            totalPages = Math.max(1, pdf.numPages);
        } catch {
            totalPages = 1;
        }

        const newDoc: DocumentMetadata = {
            id: `doc-${Date.now()}`,
            name: file.name,
            uploadDate: new Date().toISOString(),
            status: 'PENDING',
            // Data URL survives refresh; blob URLs do not.
            pdfUrl: pdfDataUrl,
            totalPages,
        };
        StorageService.saveDocument(newDoc);
        StorageService.addDocumentVersion(newDoc);
        StorageService.addNotification({
            type: 'document',
            title: 'New document uploaded',
            message: `${file.name} is ready for review`,
            read: false,
        });
        StorageService.addAuditLog({
            type: 'upload',
            actor: 'Current User',
            action: 'uploaded document',
            target: file.name,
        });
        return newDoc;
    },

    getExtractedFields: async (documentId: string): Promise<ExtractedField[]> => {
        await sleep(800);
        return StorageService.getExtractedFields(documentId);
    },

    saveExtractedFields: async (documentId: string, fields: ExtractedField[]): Promise<void> => {
        await sleep(600);
        StorageService.saveExtractedFields(documentId, fields);
    },

    getAnnotations: async (documentId: string): Promise<Annotation[]> => {
        await sleep(400);
        return StorageService.getAnnotations(documentId);
    },

    saveAnnotation: async (annotation: Annotation): Promise<Annotation> => {
        await sleep(300);
        return StorageService.saveAnnotation(annotation);
    },

    deleteAnnotation: async (id: string): Promise<void> => {
        await sleep(200);
        StorageService.deleteAnnotation(id);
    },

    getCommentsByDocument: async (documentId: string): Promise<CommentItem[]> => {
        await sleep(220);
        return StorageService.getCommentsByDocument(documentId);
    },

    saveComment: async (comment: CommentItem): Promise<CommentItem> => {
        await sleep(220);
        return StorageService.saveComment(comment);
    },

    deleteComment: async (id: string): Promise<void> => {
        await sleep(180);
        StorageService.deleteComment(id);
    },

    toggleResolveComment: async (id: string): Promise<CommentItem | null> => {
        await sleep(180);
        return StorageService.toggleResolveComment(id);
    },

    // Favorites helpers
    toggleFavorite: async (docId: string): Promise<boolean> => {
        await sleep(200);
        const docs = StorageService.getDocuments();
        const doc = docs.find(d => d.id === docId);
        if (doc) {
            doc.isFavorite = !doc.isFavorite;
            StorageService.saveDocument(doc);
            StorageService.addAuditLog({
                type: 'system',
                actor: 'Current User',
                action: doc.isFavorite ? 'starred document' : 'unstarred document',
                target: doc.name,
            });
            return doc.isFavorite || false;
        }
        return false;
    },

    getDocumentVersions: async (documentId: string) => {
        await sleep(200);
        return StorageService.getDocumentVersions(documentId);
    },
};
