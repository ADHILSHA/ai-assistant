import { useState, useEffect, useCallback, useRef } from 'react';

interface UseSpeechSynthesisProps {
  onEnd?: () => void;
  language?: string;
  rate?: number;
  pitch?: number;
}

export const useSpeechSynthesis = ({
  onEnd,
  language = 'en-US',
  rate = 1.0,
  pitch = 1.0,
}: UseSpeechSynthesisProps = {}) => {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  
  // Use refs to track state without causing re-renders
  const isSpeakingRef = useRef(false);
  const currentTextRef = useRef<string>("");

  // Check if speech synthesis is supported
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setIsSupported(true);
      
      // Initialize voices
      const loadVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices();
        setVoices(availableVoices);
        
        // Try to find a voice for the specified language
        const languageVoice = availableVoices.find(voice => voice.lang.includes(language));
        setSelectedVoice(languageVoice || availableVoices[0] || null);
      };
      
      // Chrome loads voices asynchronously
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
      
      loadVoices();
      
      // Cleanup on unmount
      return () => {
        window.speechSynthesis.cancel();
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
          window.speechSynthesis.onvoiceschanged = null;
        }
      };
    }
  }, [language]);

  // Speak text
  const speak = useCallback((text: string) => {
    if (!isSupported || !text) return;
    
    // Don't restart speaking the same text
    if (isSpeakingRef.current && currentTextRef.current === text) {
      return;
    }
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    // Update refs first
    currentTextRef.current = text;
    isSpeakingRef.current = true;
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set speech properties
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    
    utterance.lang = language;
    utterance.rate = rate;
    utterance.pitch = pitch;
    
    // Set event handlers
    utterance.onstart = () => {
      setIsSpeaking(true);
    };
    
    utterance.onend = () => {
      isSpeakingRef.current = false;
      setIsSpeaking(false);
      if (onEnd) onEnd();
    };
    
    utterance.onerror = () => {
      isSpeakingRef.current = false;
      setIsSpeaking(false);
      if (onEnd) onEnd();
    };
    
    // Start speaking
    window.speechSynthesis.speak(utterance);
  }, [isSupported, selectedVoice, language, rate, pitch, onEnd]);

  // Stop speaking
  const cancel = useCallback(() => {
    if (!isSupported) return;
    
    window.speechSynthesis.cancel();
    isSpeakingRef.current = false;
    currentTextRef.current = "";
    setIsSpeaking(false);
  }, [isSupported]);

  // Change voice
  const setVoice = useCallback((voice: SpeechSynthesisVoice) => {
    setSelectedVoice(voice);
  }, []);

  return {
    speak,
    cancel,
    isSpeaking,
    isSupported,
    voices,
    selectedVoice,
    setVoice,
  };
}; 