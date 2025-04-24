import React, { FormEvent, ChangeEvent, useState, useEffect, useRef } from 'react';
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
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const previousTranscriptRef = useRef<string>("");

  // Detect if it's a mobile device
  useEffect(() => {
    const checkIfMobile = () => {
      const userAgent = 
        typeof window.navigator === "undefined" ? "" : navigator.userAgent;
      const mobile = Boolean(
        userAgent.match(/Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i)
      );
      setIsMobileDevice(mobile);
    };
    
    checkIfMobile();
  }, []);

  // Integrate voice recognition
  const { 
    isListening, 
    toggleListening, 
    transcript, 
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

  // Create a synthetic event for submitting the form
  const submitVoiceInput = () => {
    if (transcript && setInput) {
      const syntheticEvent = {
        preventDefault: () => {},
      } as FormEvent<HTMLFormElement>;
      
      handleSubmit(syntheticEvent);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center space-x-2">
      <input
        className="flex-grow w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        value={input}
        placeholder={isListening ? "Listening..." : "Type your message or use the buttons above ✨"}
        onChange={handleInputChange}
        disabled={isLoading || isListening}
        aria-label="Chat input"
      />
      
      {isSupported && (
        <button
          type="button"
          onClick={toggleListening}
          className={`p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
            isListening 
              ? 'bg-red-600 text-white hover:bg-red-700' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
          disabled={isLoading}
          aria-label={isListening ? "Stop listening" : "Start voice input"}
        >
          {isListening ? <FaMicrophoneSlash size={20} /> : <FaMicrophone size={20} />}
        </button>
      )}
      
      <button
        type="submit"
        className="px-5 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={isLoading || !input.trim()}
        aria-label="Send message"
      >
        Send
      </button>
    </form>
  );
} 