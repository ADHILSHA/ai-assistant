import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define the ChatMessage interface (ensure this matches the hook's interface)
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: string; // ISO string
}

// Define the ChatHistoryItem interface (ensure this matches the hook's interface)
export interface ChatHistoryItem {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string; // ISO string
}

interface ChatState {
  history: ChatHistoryItem[];
  currentChatId: string | null;
}

const initialState: ChatState = {
  history: [],
  currentChatId: null,
};

// Helper to generate a chat title from the first user/assistant message
const generateChatTitle = (messageContent: string): string => {
  const maxLength = 35; // Slightly longer?
  // Trim whitespace, take first line, then truncate
  const title = messageContent.trim().split('\n')[0];
  return title.length > maxLength
    ? `${title.substring(0, maxLength)}...`
    : title || "Untitled Chat"; // Add fallback for empty messages
};

// Helper to validate a chat message
const isValidMessage = (message: unknown): message is ChatMessage => {
  if (!message || typeof message !== 'object' || message === null) return false;
  
  const msg = message as Record<string, unknown>;
  return typeof msg.id === 'string' && 
    (msg.role === 'user' || msg.role === 'assistant' || msg.role === 'system') &&
    typeof msg.content === 'string' &&
    typeof msg.createdAt === 'string';
};

// Helper to validate a chat history item
const isValidChat = (chat: unknown): chat is ChatHistoryItem => {
  if (!chat || typeof chat !== 'object' || chat === null) return false;
  
  const chatItem = chat as Record<string, unknown>;
  return typeof chatItem.id === 'string' &&
    typeof chatItem.title === 'string' &&
    Array.isArray(chatItem.messages) &&
    typeof chatItem.createdAt === 'string';
};

export const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    startNewChat: (state, action: PayloadAction<ChatMessage>) => {
      const initialMessage = action.payload;
      // Ensure the message has essential fields (caller should guarantee this)
      if (!isValidMessage(initialMessage)) {
        console.error('startNewChat called with invalid initial message:', initialMessage);
        return; // Don't proceed if message is malformed
      }

      const chatId = `chat_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`; // More robust ID
      const newChat: ChatHistoryItem = {
        id: chatId,
        // Generate title from the first message, regardless of role initially
        title: generateChatTitle(initialMessage.content),
        // Create a *new* array with the initial message
        messages: [initialMessage],
        createdAt: new Date().toISOString(), // Use current time for chat creation
      };

      // Add the new chat to the beginning of the history array
      state.history.unshift(newChat);
      state.currentChatId = chatId; // Set the new chat as the current one
    },

    clearCurrentChat: (state) => {
      state.currentChatId = null;
    },

    addMessageToChat: (state, action: PayloadAction<ChatMessage>) => {
      const messageToAdd = action.payload;

      // Ensure message is valid
      if (!isValidMessage(messageToAdd)) {
        console.error('addMessageToChat called with invalid message:', messageToAdd);
        return;
      }

      if (state.currentChatId) {
        // Find the specific chat to add the message to
        const chatIndex = state.history.findIndex(c => c.id === state.currentChatId);

        if (chatIndex !== -1) {
          const chat = state.history[chatIndex];

          // Check if message with the same ID already exists in this chat
          const messageExists = chat.messages.some(m => m.id === messageToAdd.id);

          if (!messageExists) {
            // Create a new object to break any potential references
            chat.messages.push({ ...messageToAdd });
          } else {
            console.warn(`Message with ID ${messageToAdd.id} already exists in chat ${state.currentChatId}. Skipping.`);
          }
        } else {
          console.error(`addMessageToChat: Current chat with ID ${state.currentChatId} not found in history.`);
        }
      } else {
        console.warn('addMessageToChat called but no currentChatId is set.');
      }
    },

    loadChat: (state, action: PayloadAction<string>) => {
      // Check if the chat ID exists before setting it
      if (state.history.some(chat => chat.id === action.payload)) {
        state.currentChatId = action.payload;
      } else {
        console.warn(`loadChat: Chat with ID ${action.payload} not found. Keeping current chat.`);
      }
    },

    deleteChat: (state, action: PayloadAction<string>) => {
      const idToDelete = action.payload;
      const initialLength = state.history.length;
      state.history = state.history.filter(chat => chat.id !== idToDelete);

      // If the deleted chat was the current one, select another chat
      if (state.currentChatId === idToDelete) {
        if (state.history.length > 0) {
          // Select the first chat in the remaining list (which should be the most recent due to unshift)
          state.currentChatId = state.history[0].id;
        } else {
          // No chats left
          state.currentChatId = null;
        }
      } else if (state.history.length === initialLength) {
        console.warn(`deleteChat: Chat with ID ${idToDelete} not found.`);
      }
    },

    clearAllChats: (state) => {
      state.history = [];
      state.currentChatId = null;
    },

    setEntireHistory: (state, action: PayloadAction<{
      history: ChatHistoryItem[], // Use the interface
      currentChatId: string | null
    }>) => {
      try {
        // Validate the history array first
        if (Array.isArray(action.payload.history)) {
          // Filter out any invalid chat items
          const validHistory = action.payload.history.filter(chat => isValidChat(chat));
          
          // Ensure messages within each chat are valid
          validHistory.forEach(chat => {
            chat.messages = chat.messages.filter(msg => isValidMessage(msg));
          });
          
          state.history = validHistory;
          
          // Validate and set currentChatId
          const newCurrentId = action.payload.currentChatId;
          if (newCurrentId && state.history.some(chat => chat.id === newCurrentId)) {
            state.currentChatId = newCurrentId;
          } else if (state.history.length > 0) {
            // If saved currentId is invalid or null, default to the first chat in the loaded history
            state.currentChatId = state.history[0].id;
          } else {
            state.currentChatId = null; // No chats, no currentId
          }
        } else {
          console.error("setEntireHistory received invalid history data:", action.payload.history);
        }
      } catch (error) {
        console.error("Error in setEntireHistory:", error);
        // Reset to initial state in case of critical error
        state.history = [];
        state.currentChatId = null;
      }
    }
  },
});

export const {
  startNewChat,
  addMessageToChat,
  loadChat,
  deleteChat,
  clearAllChats,
  clearCurrentChat,
  setEntireHistory
} = chatSlice.actions;

export default chatSlice.reducer;