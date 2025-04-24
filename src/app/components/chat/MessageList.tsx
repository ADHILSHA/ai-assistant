import React, { useRef, useEffect, useState } from 'react';
import Message from './Message';
import { Message as AIMessage } from '@ai-sdk/react';
import PromptButtons from './PromptButtons';
import { useSpeechSynthesis } from '../../../lib/hooks/useSpeechSynthesis';
import { FaVolumeUp, FaVolumeMute } from 'react-icons/fa';

type MessageListProps = {
  messages: AIMessage[];
  isLoading: boolean;
  onSelectPrompt?: (prompt: string) => void;
};

export default function MessageList({ messages, isLoading, onSelectPrompt }: MessageListProps) {
  // Ref for the scrollable messages container
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [autoSpeak, setAutoSpeak] = useState(false);
  const lastMessageRef = useRef<string | null>(null);
  const lastMessageIdRef = useRef<string | null>(null);

  // Initialize speech synthesis
  const { speak, cancel, isSpeaking, isSupported: isSpeechSupported } = useSpeechSynthesis();

  // Effect to scroll to bottom when messages update
  useEffect(() => {
    if (messagesContainerRef.current) {
      const scrollContainer = messagesContainerRef.current;
      // Use setTimeout to ensure the DOM has updated with new content
      setTimeout(() => {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }, 50);
    }
  }, [messages]);

  // Effect to read out assistant messages if autoSpeak is enabled
  useEffect(() => {
    // Skip if conditions aren't met
    if (!autoSpeak || !isSpeechSupported || messages.length === 0 || isLoading) return;
    
    const lastMessage = messages[messages.length - 1];
    
    // Only speak if it's a new assistant message by checking ID, not content
    if (
      lastMessage.role === 'assistant' &&
      lastMessage.id !== lastMessageIdRef.current
    ) {
      // Store the message ID first to prevent loops
      lastMessageIdRef.current = lastMessage.id || null;
      lastMessageRef.current = lastMessage.content;
      
      // Use a small timeout to break the render-speak cycle
      setTimeout(() => {
        speak(lastMessage.content);
      }, 100);
    }
  }, [messages, autoSpeak, isSpeechSupported, isLoading, speak]);

  // Toggle auto-speak function
  const toggleAutoSpeak = () => {
    if (isSpeaking) {
      cancel();
    }
    setAutoSpeak(prev => !prev);
  };

  // Speak a specific message
  const speakMessage = (content: string, messageId: string) => {
    if (isSpeaking && lastMessageIdRef.current === messageId) {
      cancel();
    } else {
      // Store the ID to track which message is being spoken
      lastMessageIdRef.current = messageId;
      lastMessageRef.current = content;
      speak(content);
    }
  };
  
  // For debugging message rendering issues
  useEffect(() => {
    console.log('Messages updated:', messages);
  }, [messages]);

  return (
    <div className="flex flex-col h-full max-h-full overflow-hidden bg-gray-50 dark:bg-gray-900" style={{ backgroundColor: 'var(--background)' }}>
      {/* Auto-speak toggle button */}
      {isSpeechSupported && (
        <div className="flex justify-end p-2 flex-shrink-0">
          <button 
            onClick={toggleAutoSpeak}
            className={`p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              autoSpeak ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'
            }`}
            aria-label={autoSpeak ? "Turn off auto-speak" : "Turn on auto-speak"}
            title={autoSpeak ? "Turn off auto-speak" : "Turn on auto-speak"}
          >
            {autoSpeak ? <FaVolumeUp size={18} /> : <FaVolumeMute size={18} />}
          </button>
        </div>
      )}
      
      <div
        ref={messagesContainerRef}
        className="flex-grow overflow-y-auto p-4 space-y-2"
        style={{ scrollBehavior: 'smooth' }}
      >
        {messages.length > 0 ? (
          messages.map((m) => (
            <Message 
              key={`msg-${m.id}-${m.role}`} 
              {...m}
              onSpeakMessage={isSpeechSupported && m.role === 'assistant' ? 
                () => speakMessage(m.content, m.id || '') : undefined}
              isSpeaking={isSpeaking && lastMessageIdRef.current === (m.id || '')}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            {onSelectPrompt ? (
              <PromptButtons onSelectPrompt={onSelectPrompt} />
            ) : (
              <div className="text-center text-gray-500 dark:text-gray-400">
                Start the conversation by typing below...
              </div>
            )}
          </div>
        )}

        {/* Display loading indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-lg shadow bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)', color: 'var(--foreground)' }}>
              <span className="block text-sm font-medium mb-1 capitalize">
                Assistant
              </span>
              <p className="text-sm text-gray-500 dark:text-gray-400 animate-pulse">Thinking...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 