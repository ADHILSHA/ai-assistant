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
  // Add a ref to track the last processed message ID
  const lastProcessedMessageIdRef = useRef<string | null>(null);
  // Add ref to track last loaded chat ID to prevent duplicate loads
  const lastLoadedChatIdRef = useRef<string | null>(null);
  
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
    setMessages,
    setInput
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
    
    // Prevent duplicate loads of the same chat
    if (currentChatId === lastLoadedChatIdRef.current) {
      return;
    }
    
    // Only update messages if we have a current chat
    if (currentChatId) {
      if (currentMessages.length > 0) {
        // If there are messages in this chat, convert and set them
        const aiMessages = currentMessages.map(mapToAIMessage);
        setMessages(aiMessages);
        lastLoadedChatIdRef.current = currentChatId;
      }
    } else {
      // If currentChatId is null (new chat), clear the messages
      setMessages([]);
      lastLoadedChatIdRef.current = null;
    }
  }, [currentChatId, currentMessages, setMessages]);

  // Effect to capture assistant responses and save them to our store
  useEffect(() => {
    // If we're not waiting for a response, don't process anything
    if (!waitingForResponseRef.current || isLoading) {
      return;
    }

    // If we have messages and we're done loading, check for an assistant message
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      
      // If the last message is from the assistant
      if (lastMessage.role === 'assistant') {
        // Check if we've already processed this message
        if (lastMessage.id !== lastProcessedMessageIdRef.current) {
          console.log('Saving assistant message to chat store:', lastMessage);
          addMessageToChat({
            id: lastMessage.id || Date.now().toString(),
            role: 'assistant',
            content: lastMessage.content,
            createdAt: new Date().toISOString()
          });
          
          // Remember that we've processed this message
          lastProcessedMessageIdRef.current = lastMessage.id;
          // No longer waiting for a response
          waitingForResponseRef.current = false;
        }
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

  // Handle prompt button selection
  const handlePromptSelect = async (promptText: string) => {
    // Set the input field with the selected prompt
    setInput(promptText);
    
    // Create a synthetic form event to submit
    const syntheticEvent = {
      preventDefault: () => {},
    } as React.FormEvent<HTMLFormElement>;
    
    // Submit the form with the selected prompt
    await handleSubmit(syntheticEvent);
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Pass isOpen and onClose props to ChatSidebar */}
      <ChatSidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />
      
      <div className="flex flex-col flex-grow h-screen overflow-hidden">
        {/* Pass onToggleSidebar prop to Header */}
        <Header onToggleSidebar={toggleSidebar} isHomePage={false} />
        
        <div className="flex-grow overflow-hidden">
          <MessageList 
            messages={messages} 
            isLoading={isLoading} 
            onSelectPrompt={handlePromptSelect}
          />
        </div>
        
        <footer className="p-4 bg-white border-t border-gray-200 shadow-inner flex-shrink-0">
          {error && <ErrorMessage message={error.message} />}
          <ChatInput 
            input={input}
            isLoading={isLoading}
            handleInputChange={handleInputChange}
            handleSubmit={handleSubmit}
            setInput={setInput}
          />
        </footer>
      </div>
    </div>
  );
}