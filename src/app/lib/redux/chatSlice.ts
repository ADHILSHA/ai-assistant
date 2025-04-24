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

export const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    startNewChat: (state, action: PayloadAction<ChatMessage>) => {
      const initialMessage = action.payload;
      // Ensure the message has essential fields (caller should guarantee this)
      if (!initialMessage || !initialMessage.id || !initialMessage.createdAt) {
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

      // Remove the complex duplicate chat check based on title. Just add the new one.
      // Add the new chat to the beginning of the history array
      state.history.unshift(newChat);
      state.currentChatId = chatId; // Set the new chat as the current one

      // NO sorting here - maintain insertion order (newest first via unshift)
    },

    clearCurrentChat: (state) => {
      state.currentChatId = null;
    },

    addMessageToChat: (state, action: PayloadAction<ChatMessage>) => {
      const messageToAdd = action.payload;

      // Ensure message is valid
      if (!messageToAdd || !messageToAdd.id || !messageToAdd.createdAt) {
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
            // Immer handles this mutation safely on the draft state
            // Ensure we are pushing a *copy* if there's any doubt about the payload source
            // Although Immer should handle payload correctly, being explicit can sometimes help debug complex issues.
            // Let's try pushing the direct payload first as it *should* work.
            // chat.messages.push(messageToAdd);

            // **If the problem persists:** Un-comment the below line and comment out the above `push`.
            // This explicitly creates a shallow copy, breaking any potential external references to the payload object.
            chat.messages.push({ ...messageToAdd });

          } else {
            console.warn(`Message with ID ${messageToAdd.id} already exists in chat ${state.currentChatId}. Skipping.`);
          }
        } else {
          console.error(`addMessageToChat: Current chat with ID ${state.currentChatId} not found in history.`);
        }
      } else {
        console.warn('addMessageToChat called but no currentChatId is set.');
        // Optionally, you could redirect to startNewChat if that's desired behavior
        // For now, just log a warning as per the hook's logic.
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
      // Directly assign the loaded history. Assume the source (localStorage) has the desired order.
      // Ensure the loaded data conforms to the expected types (basic check)
      if (Array.isArray(action.payload.history)) {
          state.history = action.payload.history;
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
          // Optionally reset to initial state or keep existing state
          // state.history = [];
          // state.currentChatId = null;
      }
      // NO sorting here - preserve loaded order
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