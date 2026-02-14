import { createSlice, type PayloadAction, nanoid } from '@reduxjs/toolkit';
import type { CommentItem } from '../../../types';

export type Comment = CommentItem;

interface CommentsState {
    entities: Record<string, Comment>;
    ids: string[];
    byAnnotation: Record<string, string[]>;
}

const initialState: CommentsState = {
    entities: {},
    ids: [],
    byAnnotation: {},
};

const commentsSlice = createSlice({
    name: 'comments',
    initialState,
    reducers: {
        addComment: (state, action: PayloadAction<Comment | Omit<Comment, 'id' | 'createdAt' | 'resolved'>>) => {
            const payload = action.payload as Partial<Comment>;
            const id = payload.id || nanoid();
            const comment: Comment = {
                ...(action.payload as Comment),
                id,
                createdAt: payload.createdAt || new Date().toISOString(),
                resolved: payload.resolved ?? false,
            };

            state.entities[id] = comment;
            state.ids.push(id);

            // Index by annotation
            if (!state.byAnnotation[comment.annotationId]) {
                state.byAnnotation[comment.annotationId] = [];
            }
            state.byAnnotation[comment.annotationId].push(id);
        },

        updateComment: (state, action: PayloadAction<{ id: string; content: string }>) => {
            const { id, content } = action.payload;
            if (state.entities[id]) {
                state.entities[id].content = content;
                state.entities[id].updatedAt = new Date().toISOString();
            }
        },

        deleteComment: (state, action: PayloadAction<string>) => {
            const id = action.payload;
            const comment = state.entities[id];

            if (comment) {
                // Remove from byAnnotation index
                state.byAnnotation[comment.annotationId] = state.byAnnotation[comment.annotationId].filter(
                    commentId => commentId !== id
                );

                delete state.entities[id];
                state.ids = state.ids.filter(commentId => commentId !== id);
            }
        },

        toggleResolve: (state, action: PayloadAction<string>) => {
            const id = action.payload;
            if (state.entities[id]) {
                state.entities[id].resolved = !state.entities[id].resolved;
            }
        },

        setComments: (state, action: PayloadAction<Comment[]>) => {
            state.entities = {};
            state.ids = [];
            state.byAnnotation = {};
            action.payload.forEach((comment) => {
                state.entities[comment.id] = comment;
                state.ids.push(comment.id);
                if (!state.byAnnotation[comment.annotationId]) {
                    state.byAnnotation[comment.annotationId] = [];
                }
                state.byAnnotation[comment.annotationId].push(comment.id);
            });
        },
    },
});

export const {
    addComment,
    updateComment,
    deleteComment,
    toggleResolve,
    setComments,
} = commentsSlice.actions;

export default commentsSlice.reducer;
