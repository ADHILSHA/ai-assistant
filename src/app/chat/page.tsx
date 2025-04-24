// app/chat/page.tsx (or app/page.tsx)
'use client'; // Required for hooks like useState, useEffect, and useChat

import { useChat, Message } from '@ai-sdk/react';
import Header from '../components/chat/Header';
import MessageList from '../components/chat/MessageList';
import ChatInput from '../components/chat/ChatInput';
import ErrorMessage from '../components/chat/ErrorMessage';
import ChatSidebar from '../components/chat/ChatSidebar';
import { useChatHistory, ChatMessage } from '../lib/hooks/useChatHistory';
import { useEffect, useRef, useState } from 'react';

// Convert our ChatMessage to AI SDK Message format
const mapToAIMessage = (chatMessage: ChatMessage): Message => ({
  id: chatMessage.id,
  role: chatMessage.role,
  content: chatMessage.content,
  createdAt: new Date(chatMessage.createdAt)
});

export default function ChatPage() {
  // To track when we're expecting a response
  const waitingForResponseRef = useRef(false);
  const initialRenderRef = useRef(true);
  
  // Add state for sidebar visibility on mobile
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Toggle sidebar function
  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };
  
  // Initialize chat with AI SDK
  const { 
    messages, 
    input, 
    handleInputChange, 
    handleSubmit: aiHandleSubmit, 
    isLoading, 
    error,
    setMessages
  } = useChat({
    api: '/api/v1/chat',
  });

  // Get chat history functionality
  const { 
    currentChatId, 
    currentMessages, 
    startNewChat, 
    addMessageToChat 
  } = useChatHistory();

  // When current chat changes, load its messages
  useEffect(() => {
    // Only run after initial render
    if (initialRenderRef.current) {
      initialRenderRef.current = false;
      return;
    }
    
    // Don't update messages when waiting for a response to avoid UI flicker
    if (waitingForResponseRef.current) {
      return;
    }
    
    // Only update messages if we have a current chat
    if (currentChatId) {
      if (currentMessages.length > 0) {
        // If there are messages in this chat, convert and set them
        const aiMessages = currentMessages.map(mapToAIMessage);
        setMessages(aiMessages);
      }
    } else {
      // If currentChatId is null (new chat), clear the messages
      setMessages([]);
    }
  }, [currentChatId, currentMessages, setMessages]);

  // Effect to capture assistant responses and save them to our store
  useEffect(() => {
    // Don't run on initial render or when we're not waiting for a response
    if (initialRenderRef.current || !waitingForResponseRef.current) {
      return;
    }
    
    // If we have messages and we're done loading, check for an assistant message
    if (messages.length > 0 && !isLoading) {
      const lastMessage = messages[messages.length - 1];
      
      // If the last message is from the assistant, save it
      if (lastMessage.role === 'assistant') {
        addMessageToChat({
          id: lastMessage.id || Date.now().toString(),
          role: 'assistant',
          content: lastMessage.content,
          createdAt: new Date().toISOString()
        });
        
        // No longer waiting for a response
        waitingForResponseRef.current = false;
      }
    }
  }, [messages, isLoading, addMessageToChat]);

  // Custom handleSubmit that also updates chat history
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!input.trim()) return;

    // Format the message for our store
    const userMessage = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: input,
      createdAt: new Date().toISOString()
    };

    // If no current chat, start a new one with this message
    if (!currentChatId) {
      startNewChat(userMessage);
    } else {
      // Add to existing chat
      addMessageToChat(userMessage);
    }

    // Close sidebar on mobile when submitting a message
    setIsSidebarOpen(false);

    // Mark that we're waiting for a response
    waitingForResponseRef.current = true;
    
    // Let AI SDK handle the actual API call
    await aiHandleSubmit(e);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Pass isOpen and onClose props to ChatSidebar */}
      <ChatSidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />
      
      <div className="flex flex-col flex-grow h-screen">
        {/* Pass onToggleSidebar prop to Header */}
        <Header onToggleSidebar={toggleSidebar} />
        
        <MessageList messages={messages} isLoading={isLoading} />
        
        <footer className="p-4 bg-white border-t border-gray-200 shadow-inner">
          {error && <ErrorMessage message={error.message} />}
          <ChatInput 
            input={input}
            isLoading={isLoading}
            handleInputChange={handleInputChange}
            handleSubmit={handleSubmit}
          />
        </footer>
      </div>
    </div>
  );
}