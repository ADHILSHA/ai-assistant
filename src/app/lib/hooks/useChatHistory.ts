'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { startNewChat, addMessageToChat, loadChat, deleteChat, setEntireHistory } from '../redux/chatSlice';

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
        
        // If there's history, restore it all at once
        if (parsed.history?.length > 0) {
          // Use the new reducer to set the entire history at once
          dispatch(setEntireHistory({
            history: parsed.history,
            currentChatId: parsed.currentChatId
          }));
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
    // Debounce saving to avoid performance issues
    const timeout = setTimeout(() => {
      // Only save if we have history
      if (history.length > 0) {
        const state = { 
          history: [...history].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
          currentChatId 
        };
        localStorage.setItem('chatHistory', JSON.stringify(state));
        console.log('Saved chat history to localStorage:', state);
      } else if (localStorage.getItem('chatHistory')) {
        // Clean up localStorage if all chats are deleted
        localStorage.removeItem('chatHistory');
      }
    }, 500);
    
    return () => clearTimeout(timeout);
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