import { useState, useEffect, useCallback } from 'react';

// Type declarations for the Web Speech API
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
}

interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
  length: number;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognition;
    webkitSpeechRecognition?: new () => SpeechRecognition;
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
}

interface UseVoiceRecognitionProps {
  onResult?: (transcript: string) => void;
  onEnd?: () => void;
  language?: string;
}

export const useVoiceRecognition = ({
  onResult,
  onEnd,
  language = 'en-US',
}: UseVoiceRecognitionProps = {}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Check if the browser supports the Web Speech API
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      setIsSupported(true);
      const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognitionAPI) {
        const recognition = new SpeechRecognitionAPI();
        
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = language;
        
        setRecognition(recognition);
      }
    }
  }, [language]);

  const startListening = useCallback(() => {
    if (!recognition) return;
    
    setTranscript('');
    setIsListening(true);
    
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const current = event.resultIndex;
      const result = event.results[current];
      const transcript = result[0].transcript;
      
      setTranscript(transcript);
      if (onResult) onResult(transcript);
    };
    
    recognition.onend = () => {
      if (isListening) {
        recognition.start();
      } else {
        if (onEnd) onEnd();
      }
    };
    
    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
    };
    
    recognition.start();
  }, [recognition, isListening, onResult, onEnd]);

  const stopListening = useCallback(() => {
    if (!recognition) return;
    
    setIsListening(false);
    recognition.stop();
    if (onEnd) onEnd();
  }, [recognition, onEnd]);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    toggleListening,
    isSupported,
  };
}; 