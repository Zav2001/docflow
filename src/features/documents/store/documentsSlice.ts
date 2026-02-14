import { createSlice, createEntityAdapter } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { DocumentMetadata } from '../../../types';

const documentsAdapter = createEntityAdapter<DocumentMetadata>();

interface DocumentsState extends ReturnType<typeof documentsAdapter.getInitialState> {
    selectedDocumentId: string | null;
    currentPage: number;
    zoomLevel: number;
    rotation: number;
}

const initialState: DocumentsState = documentsAdapter.getInitialState({
    selectedDocumentId: null,
    currentPage: 1,
    zoomLevel: 1.0,
    rotation: 0,
});

export const documentsSlice = createSlice({
    name: 'documents',
    initialState,
    reducers: {
        setDocuments: documentsAdapter.setAll,
        selectDocument: (state, action: PayloadAction<string>) => {
            state.selectedDocumentId = action.payload;
        },
        setCurrentPage: (state, action: PayloadAction<number>) => {
            state.currentPage = action.payload;
        },
        setZoomLevel: (state, action: PayloadAction<number>) => {
            state.zoomLevel = action.payload;
        },
        rotate: (state) => {
            state.rotation = (state.rotation + 90) % 360;
        },
    },
});

export const { setDocuments, selectDocument, setCurrentPage, setZoomLevel, rotate } = documentsSlice.actions;

export const documentsSelectors = documentsAdapter.getSelectors(
    (state: { documents: DocumentsState }) => state.documents
);

export default documentsSlice.reducer;
