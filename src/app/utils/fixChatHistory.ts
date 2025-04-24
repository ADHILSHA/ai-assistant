/**
 * Utility functions to help repair corrupted chat history
 */

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: string;
}

interface ChatHistoryItem {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
}

interface ChatState {
  history: ChatHistoryItem[];
  currentChatId: string | null;
}

/**
 * Repairs chat history from localStorage by deduplicating chats and messages
 * Returns the fixed history that can be saved back
 */
export function repairChatHistory(): ChatState | null {
  try {
    // Try to load the chat history from localStorage
    const savedHistory = localStorage.getItem('chatHistory');
    if (!savedHistory) {
      console.log('No chat history found in localStorage');
      return null;
    }

    // Parse the history
    const parsed = JSON.parse(savedHistory);
    
    // Check if it has the expected structure
    if (!parsed || !Array.isArray(parsed.history)) {
      console.error('Invalid chat history format in localStorage');
      return null;
    }

    // Deduplicate chats by ID, keeping the newest version
    const uniqueChats = new Map<string, ChatHistoryItem>();
    
    parsed.history.forEach((chat: any) => {
      // Skip invalid chats
      if (!chat.id || !chat.title || !Array.isArray(chat.messages) || !chat.createdAt) {
        return;
      }
      
      // If we don't have this chat yet or this version is newer than what we have
      if (!uniqueChats.has(chat.id) || 
          new Date(chat.createdAt).getTime() > new Date(uniqueChats.get(chat.id)!.createdAt).getTime()) {
        // Deduplicate messages within this chat
        const uniqueMessages = new Map<string, ChatMessage>();
        
        chat.messages.forEach((msg: any) => {
          // Skip invalid messages
          if (!msg.id || !msg.role || !msg.content || !msg.createdAt) {
            return;
          }
          
          // Create a unique key for this message
          const msgKey = `${msg.id}-${msg.role}-${msg.content}`;
          
          // Keep the newest version of duplicate messages
          if (!uniqueMessages.has(msgKey) || 
              new Date(msg.createdAt).getTime() > new Date(uniqueMessages.get(msgKey)!.createdAt).getTime()) {
            uniqueMessages.set(msgKey, {
              id: msg.id,
              role: msg.role,
              content: msg.content,
              createdAt: msg.createdAt
            });
          }
        });
        
        // Store the chat with deduplicated messages
        uniqueChats.set(chat.id, {
          id: chat.id,
          title: chat.title,
          messages: Array.from(uniqueMessages.values()),
          createdAt: chat.createdAt
        });
      }
    });
    
    // Convert to array and sort by date (newest first)
    const cleanedHistory = Array.from(uniqueChats.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    // Make sure currentChatId refers to an existing chat
    let currentChatId = parsed.currentChatId;
    const chatExists = cleanedHistory.some(chat => chat.id === currentChatId);
    
    if (!chatExists && cleanedHistory.length > 0) {
      // If the current chat doesn't exist anymore, use the newest chat
      currentChatId = cleanedHistory[0].id;
    }
    
    return {
      history: cleanedHistory,
      currentChatId
    };
  } catch (error) {
    console.error('Failed to repair chat history:', error);
    return null;
  }
}

/**
 * Applies the fixed chat history to localStorage
 * Returns true if successful, false otherwise
 */
export function applyFixedChatHistory(): boolean {
  try {
    const fixedHistory = repairChatHistory();
    
    if (!fixedHistory) {
      return false;
    }
    
    // Save the fixed history back to localStorage
    localStorage.setItem('chatHistory', JSON.stringify(fixedHistory));
    console.log('Successfully repaired chat history');
    
    return true;
  } catch (error) {
    console.error('Failed to apply fixed chat history:', error);
    return false;
  }
}

/**
 * Allows running the repair from the browser console
 * Makes the repair functions available globally
 */
if (typeof window !== 'undefined') {
  // @ts-ignore - Add to window for debugging
  window.repairChatHistory = repairChatHistory;
  // @ts-ignore - Add to window for debugging
  window.applyFixedChatHistory = applyFixedChatHistory;
} 