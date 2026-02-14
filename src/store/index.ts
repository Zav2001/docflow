import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import documentsReducer from '../features/documents/store/documentsSlice';
import annotationsReducer from '../features/annotations/store/annotationsSlice';
import commentsReducer from '../features/comments/store/commentsSlice';
import notificationsReducer from '../features/notifications/store/notificationsSlice';
import sessionReducer from '../features/session/store/sessionSlice';

export const store = configureStore({
    reducer: {
        documents: documentsReducer,
        annotations: annotationsReducer,
        comments: commentsReducer,
        notifications: notificationsReducer,
        session: sessionReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false, // For easier handling of PDF data if needed
        }),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
