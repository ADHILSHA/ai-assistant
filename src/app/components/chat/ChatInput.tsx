import React, { FormEvent, ChangeEvent, useRef } from 'react';
import { useVoiceRecognition } from '../../../lib/hooks/useVoiceRecognition';
import { FaMicrophone, FaMicrophoneSlash } from 'react-icons/fa';

type ChatInputProps = {
  input: string;
  isLoading: boolean;
  handleInputChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: FormEvent<HTMLFormElement>) => void;
  setInput?: (input: string) => void;
};

export default function ChatInput({
  input,
  isLoading,
  handleInputChange,
  handleSubmit,
  setInput,
}: ChatInputProps) {
 
  const previousTranscriptRef = useRef<string>("");

  // Integrate voice recognition
  const { 
    isListening, 
    toggleListening, 
    isSupported 
  } = useVoiceRecognition({
    onResult: (result) => {
      // Skip if transcript hasn't actually changed
      if (setInput && result !== previousTranscriptRef.current) {
        previousTranscriptRef.current = result;
        setInput(result);
      }
    },
  });

  return (
    <form onSubmit={handleSubmit} className="flex items-center space-x-2">
      <input
        className="flex-grow w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        value={input}
        placeholder={isListening ? "Listening..." : "Type your message or use the buttons above ✨"}
        onChange={handleInputChange}
        disabled={isLoading || isListening}
        aria-label="Chat input"
        style={{ 
          backgroundColor: 'var(--input-bg)', 
          borderColor: 'var(--input-border)', 
          color: 'var(--foreground)' 
        }}
      />
      
      {isSupported && (
        <button
          type="button"
          onClick={toggleListening}
          className={`p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer ${
            isListening 
              ? 'bg-red-600 text-white hover:bg-red-700' 
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
          disabled={isLoading}
          aria-label={isListening ? "Stop listening" : "Start voice input"}
          style={!isListening ? { backgroundColor: 'var(--card-bg)', color: 'var(--foreground)' } : {}}
        >
          {isListening ? <FaMicrophoneSlash size={20} /> : <FaMicrophone size={20} />}
        </button>
      )}
      
      <button
        type="submit"
        className="px-5 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        disabled={isLoading || !input.trim()}
        aria-label="Send message"
        style={{ backgroundColor: 'var(--button-bg)' }}
      >
        Send
      </button>
    </form>
  );
} 