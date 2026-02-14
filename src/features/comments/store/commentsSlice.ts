import { createSlice, type PayloadAction, nanoid } from '@reduxjs/toolkit';

export interface Comment {
    id: string;
    annotationId: string;
    documentId: string;
    authorId: string;
    authorName: string;
    content: string;
    mentions: string[];
    createdAt: string;
    updatedAt?: string;
    parentId?: string; // For replies
    resolved: boolean;
}

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
        addComment: (state, action: PayloadAction<Omit<Comment, 'id' | 'createdAt' | 'resolved'>>) => {
            const id = nanoid();
            const comment: Comment = {
                ...action.payload,
                id,
                createdAt: new Date().toISOString(),
                resolved: false,
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
    },
});

export const {
    addComment,
    updateComment,
    deleteComment,
    toggleResolve,
} = commentsSlice.actions;

export default commentsSlice.reducer;
