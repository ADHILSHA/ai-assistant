import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define a simpler message type that doesn't cause circular type references
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: string;
}

interface ChatState {
  history: {
    id: string;
    title: string;
    messages: ChatMessage[];
    createdAt: string;
  }[];
  currentChatId: string | null;
}

const initialState: ChatState = {
  history: [],
  currentChatId: null,
};

// Helper to generate a chat title from the first user message
const generateChatTitle = (message: string): string => {
  const maxLength = 30;
  const title = message.trim().split('\n')[0];
  return title.length > maxLength 
    ? `${title.substring(0, maxLength)}...` 
    : title;
};

export const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    startNewChat: (state, action: PayloadAction<ChatMessage>) => {
      const chatId = Date.now().toString();
      const newChat = {
        id: chatId,
        title: generateChatTitle(action.payload.content),
        messages: [action.payload],
        createdAt: new Date().toISOString(),
      };
      
      // Check if this is a duplicate title (same first message)
      const existingChatIndex = state.history.findIndex(
        chat => chat.title === newChat.title
      );
      
      // If duplicate found, update that chat instead of creating a new one
      if (existingChatIndex >= 0) {
        state.history.splice(existingChatIndex, 1); // Remove the old chat
      }
      
      state.history.unshift(newChat);
      state.currentChatId = chatId;
    },
    addMessageToChat: (state, action: PayloadAction<ChatMessage>) => {
      if (state.currentChatId) {
        const chat = state.history.find(c => c.id === state.currentChatId);
        if (chat) {
          // Check for duplicates before adding
          const isDuplicate = chat.messages.some(
            m => m.content === action.payload.content && m.role === action.payload.role
          );
          
          if (!isDuplicate) {
            chat.messages.push(action.payload);
          }
        }
      }
    },
    loadChat: (state, action: PayloadAction<string>) => {
      state.currentChatId = action.payload;
    },
    deleteChat: (state, action: PayloadAction<string>) => {
      state.history = state.history.filter(chat => chat.id !== action.payload);
      if (state.currentChatId === action.payload) {
        state.currentChatId = state.history.length > 0 ? state.history[0].id : null;
      }
    },
    clearAllChats: (state) => {
      state.history = [];
      state.currentChatId = null;
      // This will help reset everything if the history gets corrupted
    }
  },
});

export const { 
  startNewChat, 
  addMessageToChat, 
  loadChat, 
  deleteChat,
  clearAllChats 
} = chatSlice.actions;
export default chatSlice.reducer; 