import React, { useRef, useEffect } from 'react';
import Message from './Message';
import { Message as AIMessage } from '@ai-sdk/react';

type MessageListProps = {
  messages: AIMessage[];
  isLoading: boolean;
};

export default function MessageList({ messages, isLoading }: MessageListProps) {
  // Ref for the scrollable messages container
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Effect to scroll to bottom when messages update
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);
  
  // For debugging message rendering issues
  useEffect(() => {
    console.log('Messages updated:', messages);
  }, [messages]);

  return (
    <div
      ref={messagesContainerRef}
      className="flex-grow overflow-y-auto p-4 space-y-4"
    >
      {messages.length > 0 ? (
        messages.map((m) => (
          <Message 
            key={`msg-${m.id}-${m.role}`} 
            {...m} 
          />
        ))
      ) : (
        <div className="text-center text-gray-500 mt-10">
          Start the conversation by typing below...
        </div>
      )}

      {/* Display loading indicator */}
      {isLoading && (
        <div className="flex justify-start">
          <div className="max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-lg shadow bg-white text-gray-800 border border-gray-200">
            <span className="block text-sm font-medium mb-1 capitalize">
              Assistant
            </span>
            <p className="text-sm text-gray-500 animate-pulse">Thinking...</p>
          </div>
        </div>
      )}
    </div>
  );
} 