'use client';

import { useEffect, useRef } from 'react'; // Added useRef
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { startNewChat, addMessageToChat, loadChat, deleteChat, setEntireHistory } from '../redux/chatSlice';

// Define the ChatMessage interface
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: string; // Keep as ISO string for reliable serialization/comparison
}

// Define the ChatHistory interface
export interface ChatHistoryItem {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string; // Keep as ISO string
}

// This hook manages chat history and handles persistence to localStorage
export function useChatHistory() {
  const dispatch = useAppDispatch();
  const { history, currentChatId } = useAppSelector((state) => state.chat);
  const isInitialLoad = useRef(true); // Flag to prevent re-loading from localStorage after initial mount

  // Load chat history from localStorage on initial mount
  useEffect(() => {
    // Only run this effect once on initial mount
    if (!isInitialLoad.current) {
      return;
    }
    isInitialLoad.current = false; // Mark initial load as done

    const savedHistory = localStorage.getItem('chatHistory');
    // Only load if Redux state is empty AND there's saved data
    if (savedHistory && history.length === 0) {
      try {
        const parsed = JSON.parse(savedHistory);

        // Validate parsed structure slightly
        if (parsed && Array.isArray(parsed.history)) {
          // Restore the entire history and currentChatId
          // Assumes setEntireHistory correctly handles the payload
          dispatch(setEntireHistory({
            // Ensure dates are potentially rehydrated if needed, although ISO strings should be fine
            history: parsed.history.map((chat: ChatHistoryItem) => ({
                ...chat,
                // Optional: Re-parse dates if they were stored differently, but ISO strings are preferred
                // createdAt: new Date(chat.createdAt),
                messages: chat.messages.map((msg: ChatMessage) => ({
                    ...msg,
                    // createdAt: new Date(msg.createdAt)
                }))
            })),
            currentChatId: parsed.currentChatId || null // Ensure currentChatId is null if not present
          }));
           console.log('Restored chat history from localStorage.');
        } else {
           console.warn('Failed to restore chat history: Invalid format found in localStorage.');
           localStorage.removeItem('chatHistory');
        }
      } catch (error) {
        console.error('Failed to parse or restore chat history:', error);
        // If restoration fails, clear potentially corrupted localStorage
        localStorage.removeItem('chatHistory');
      }
    }
  }, [dispatch, history.length]); // Dependency on history.length ensures it runs if state is cleared externally

  // Save chat history to localStorage whenever it changes
  useEffect(() => {
    // Debounce saving to avoid performance issues during rapid changes
    const timeout = setTimeout(() => {
      // Prevent saving during the very initial load/hydration phase before history is potentially populated
      if (isInitialLoad.current && history.length === 0) {
         return;
      }

      if (history.length > 0) {
        // Save the state exactly as it is in Redux, preserving its order
        const stateToSave = {
          history: history, // No sorting here!
          currentChatId
        };
        localStorage.setItem('chatHistory', JSON.stringify(stateToSave));
        // console.log('Saved chat history to localStorage:', stateToSave); // Verbose logging, maybe remove for production
      } else {
        // Clean up localStorage if all chats are deleted
        if (localStorage.getItem('chatHistory')) {
          localStorage.removeItem('chatHistory');
          console.log('Removed chat history from localStorage as it is empty.');
        }
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timeout); // Cleanup timeout on unmount or dependency change
  }, [history, currentChatId]); // Run whenever history or currentChatId changes

  // Memoize current messages calculation (optional but good practice)
  const currentChat = history.find(chat => chat.id === currentChatId);
  const currentMessages = currentChat?.messages || [];

  return {
    history, // The history array directly from Redux (order preserved)
    currentChatId,
    currentMessages, // Messages for the currently selected chat

    startNewChat: (initialMessage: ChatMessage) => {
      // Ensure the initial message has necessary fields like a unique ID and createdAt
      console.log('Dispatching startNewChat with message:', initialMessage);
      dispatch(startNewChat(initialMessage));
    },

    addMessageToChat: (message: ChatMessage) => {
      // Only add a message if a chat is currently selected/active
      if (currentChatId) {
        // Removed the potentially problematic duplicate check.
        // Assume message has a unique ID and should be added.
        // Duplicate prevention should ideally happen before calling this hook's function.
        console.log(`Dispatching addMessageToChat (${message.id}) to chat:`, currentChatId);
        dispatch(addMessageToChat(message));
      } else {
        // It's generally an application logic error to call addMessageToChat without an active chat.
        // The UI should call startNewChat first.
        console.warn('addMessageToChat called but no currentChatId is set. Message not added.');
      }
    },

    loadChat: (id: string) => {
      console.log('Dispatching loadChat:', id);
      dispatch(loadChat(id));
    },

    deleteChat: (id: string) => {
      console.log('Dispatching deleteChat:', id);
      dispatch(deleteChat(id));
    },
  };
}