import { createSlice, type PayloadAction, nanoid } from '@reduxjs/toolkit';
import type { Annotation } from '../../../types';

interface AnnotationsState {
    entities: Record<string, Annotation>;
    ids: string[];
    history: {
        past: Record<string, Annotation>[];
        future: Record<string, Annotation>[];
    };
}

const initialState: AnnotationsState = {
    entities: {},
    ids: [],
    history: {
        past: [],
        future: [],
    },
};

const annotationsSlice = createSlice({
    name: 'annotations',
    initialState,
    reducers: {
        addAnnotation: (state, action: PayloadAction<Annotation | Omit<Annotation, 'id' | 'createdAt'>>) => {
            // Save current state to history
            state.history.past.push({ ...state.entities });
            state.history.future = [];

            const payload = action.payload as Partial<Annotation>;
            const id = payload.id || nanoid();
            const annotation: Annotation = {
                ...(action.payload as Annotation),
                id,
                createdAt: payload.createdAt || new Date().toISOString(),
            };
            state.entities[id] = annotation;
            state.ids.push(id);
        },

        updateAnnotation: (state, action: PayloadAction<{ id: string; changes: Partial<Annotation> }>) => {
            state.history.past.push({ ...state.entities });
            state.history.future = [];

            const { id, changes } = action.payload;
            if (state.entities[id]) {
                state.entities[id] = { ...state.entities[id], ...changes };
            }
        },

        deleteAnnotation: (state, action: PayloadAction<string>) => {
            state.history.past.push({ ...state.entities });
            state.history.future = [];

            const id = action.payload;
            delete state.entities[id];
            state.ids = state.ids.filter(annotationId => annotationId !== id);
        },

        undo: (state) => {
            if (state.history.past.length > 0) {
                const previous = state.history.past.pop()!;
                state.history.future.push({ ...state.entities });
                state.entities = previous;
                state.ids = Object.keys(previous);
            }
        },

        redo: (state) => {
            if (state.history.future.length > 0) {
                const next = state.history.future.pop()!;
                state.history.past.push({ ...state.entities });
                state.entities = next;
                state.ids = Object.keys(next);
            }
        },

        setAnnotations: (state, action: PayloadAction<Annotation[]>) => {
            state.entities = {};
            state.ids = [];
            action.payload.forEach(annotation => {
                state.entities[annotation.id] = annotation;
                state.ids.push(annotation.id);
            });
        },
    },
});

export const {
    addAnnotation,
    updateAnnotation,
    deleteAnnotation,
    undo,
    redo,
    setAnnotations,
} = annotationsSlice.actions;

export default annotationsSlice.reducer;
