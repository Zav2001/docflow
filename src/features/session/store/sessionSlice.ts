import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { User } from '../../../types';

interface SessionState {
    currentUser: User | null;
    initialized: boolean;
}

const initialState: SessionState = {
    currentUser: null,
    initialized: false,
};

const sessionSlice = createSlice({
    name: 'session',
    initialState,
    reducers: {
        setCurrentUser: (state, action: PayloadAction<User | null>) => {
            state.currentUser = action.payload;
            state.initialized = true;
        },
        setSessionInitialized: (state, action: PayloadAction<boolean>) => {
            state.initialized = action.payload;
        },
    },
});

export const { setCurrentUser, setSessionInitialized } = sessionSlice.actions;

export default sessionSlice.reducer;
