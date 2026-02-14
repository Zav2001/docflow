import type { DocumentMetadata, ExtractedField, User } from '../types';

export const MOCK_USER: User = {
    id: 'user-1',
    name: 'Senior Architect',
    role: 'ADMIN',
};

export const MOCK_DOCUMENTS: DocumentMetadata[] = [
    {
        id: 'doc-1',
        name: 'Invoice_2024_001.pdf',
        uploadDate: '2024-02-10T10:00:00Z',
        status: 'PENDING',
        pdfUrl: '/samples/invoice.pdf',
        totalPages: 1,
    },
    {
        id: 'doc-2',
        name: 'MSA_Acme_Corp.pdf',
        uploadDate: '2024-02-11T14:30:00Z',
        status: 'REVIEWED',
        pdfUrl: '/samples/contract.pdf',
        totalPages: 1,
    }
];

export const MOCK_EXTRACTED_FIELDS: ExtractedField[] = [
    {
        id: 'field-1',
        label: 'Vendor Name',
        value: 'Acme Solutions Inc.',
        confidence: 0.98,
        pageIndex: 0,
        fieldType: 'TEXT',
    },
    {
        id: 'field-2',
        label: 'Total Amount',
        value: '$1,250.00',
        confidence: 0.85,
        pageIndex: 0,
        fieldType: 'CURRENCY',
    },
    {
        id: 'field-3',
        label: 'Invoice Date',
        value: '2024-01-15',
        confidence: 0.92,
        pageIndex: 0,
        fieldType: 'DATE',
    },
];
