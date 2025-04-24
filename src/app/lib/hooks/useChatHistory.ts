'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { startNewChat, addMessageToChat, loadChat, deleteChat } from '../redux/chatSlice';

// Define the ChatMessage interface
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: string;
}

// Define the ChatHistory interface
export interface ChatHistoryItem {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
}

// This hook manages chat history and handles persistence to localStorage
export function useChatHistory() {
  const dispatch = useAppDispatch();
  const { history, currentChatId } = useAppSelector((state) => state.chat);
  
  // Load chat history from localStorage on initial load
  useEffect(() => {
    const savedHistory = localStorage.getItem('chatHistory');
    if (savedHistory && history.length === 0) { // Only load if empty state
      try {
        const parsed = JSON.parse(savedHistory);
        
        // If there's history, restore it
        if (parsed.history?.length > 0) {
          // We'll restore it all at once to avoid rendering issues
          for (const chat of parsed.history) {
            if (chat.messages.length > 0) {
              dispatch(startNewChat(chat.messages[0]));
              // Add remaining messages for this chat
              if (chat.messages.length > 1) {
                for (let i = 1; i < chat.messages.length; i++) {
                  dispatch(addMessageToChat(chat.messages[i]));
                }
              }
            }
          }
          
          // Set current chat
          if (parsed.currentChatId) {
            dispatch(loadChat(parsed.currentChatId));
          }
        }
      } catch (error) {
        console.error('Failed to restore chat history:', error);
        // If restoration fails, clear localStorage to avoid future errors
        localStorage.removeItem('chatHistory');
      }
    }
  }, [dispatch, history.length]);
  
  // Save chat history to localStorage when it changes
  useEffect(() => {
    if (history.length > 0) {
      // Debounce saving to avoid performance issues
      const timeout = setTimeout(() => {
        const state = { history, currentChatId };
        localStorage.setItem('chatHistory', JSON.stringify(state));
        console.log('Saved chat history to localStorage:', state);
      }, 500);
      
      return () => clearTimeout(timeout);
    }
  }, [history, currentChatId]);
  
  // Return current chat messages if there's an active chat
  const currentChat = currentChatId 
    ? history.find(chat => chat.id === currentChatId) 
    : null;
  
  const currentMessages = currentChat?.messages || [];
  
  return {
    history,
    currentChatId,
    currentMessages,
    startNewChat: (message: ChatMessage) => {
      console.log('Starting new chat with message:', message);
      dispatch(startNewChat(message));
    },
    addMessageToChat: (message: ChatMessage) => {
      // Check if this message is already in the current chat to avoid duplicates
      if (currentChatId) {
        const chat = history.find(c => c.id === currentChatId);
        const isDuplicate = chat?.messages.some(m => 
          m.content === message.content && m.role === message.role
        );
        
        // Only dispatch if not a duplicate
        if (!isDuplicate) {
          console.log('Adding message to chat:', message);
          dispatch(addMessageToChat(message));
        } else {
          console.log('Skipping duplicate message:', message);
        }
      } else {
        console.log('Adding message to chat (no current chat):', message);
        dispatch(addMessageToChat(message));
      }
    },
    loadChat: (id: string) => {
      console.log('Loading chat:', id);
      dispatch(loadChat(id));
    },
    deleteChat: (id: string) => {
      console.log('Deleting chat:', id);
      dispatch(deleteChat(id));
    },
  };
} 