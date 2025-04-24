import { configureStore } from '@reduxjs/toolkit';
import chatReducer from './chatSlice';

// Function to create a new store instance for server-side rendering
export function makeStore() {
  return configureStore({
    reducer: {
      chat: chatReducer,
    },
    // Add middleware to handle serialization errors in development
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          // Ignore specific action types that might contain non-serializable data
          ignoredActions: ['setEntireHistory'],
        },
      }),
  });
}

// Create a single store instance for client-side usage
export const store = makeStore();

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 