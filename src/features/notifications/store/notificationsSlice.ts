import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { NotificationItem } from '../../../types';

interface NotificationsState {
    items: NotificationItem[];
}

const initialState: NotificationsState = {
    items: [],
};

const notificationsSlice = createSlice({
    name: 'notifications',
    initialState,
    reducers: {
        setNotifications: (state, action: PayloadAction<NotificationItem[]>) => {
            state.items = action.payload;
        },
        addNotification: (state, action: PayloadAction<NotificationItem>) => {
            state.items = [action.payload, ...state.items];
        },
        markNotificationAsRead: (state, action: PayloadAction<string>) => {
            const notification = state.items.find((n) => n.id === action.payload);
            if (notification) {
                notification.read = true;
            }
        },
        markAllNotificationsAsRead: (state) => {
            state.items = state.items.map((n) => ({ ...n, read: true }));
        },
    },
});

export const {
    setNotifications,
    addNotification,
    markNotificationAsRead,
    markAllNotificationsAsRead,
} = notificationsSlice.actions;

export default notificationsSlice.reducer;
