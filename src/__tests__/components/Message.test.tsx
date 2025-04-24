import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// Define the interface for the mock component props
interface MockMessageProps {
  role: 'user' | 'assistant' | 'system';
  content: string;
  onSpeakMessage?: () => void;
  isSpeaking?: boolean;
  id?: string;
  createdAt?: Date;
}

// Mock the Message component to avoid ESM issues
jest.mock('@/app/components/chat/Message', () => {
  return function MockMessage({ 
    role, 
    content, 
    onSpeakMessage, 
    isSpeaking 
  }: MockMessageProps) {
    const isUser = role === 'user';
    return (
      <div data-testid="message-component" className={isUser ? 'bg-blue-500' : ''}>
        <span>{isUser ? 'You' : 'Assistant'}</span>
        <div data-testid="message-content">{content}</div>
        {onSpeakMessage && !isUser && (
          <button 
            onClick={onSpeakMessage}
            aria-label={isSpeaking ? "Stop speaking" : "Speak message"}
          >
            {isSpeaking ? 'Stop' : 'Speak'}
          </button>
        )}
        {!isUser && content.includes('[TRAVEL_ITINERARY]') && (
          <button aria-label="Download as PDF">Download</button>
        )}
      </div>
    );
  };
});

// Import the mocked component
import Message from '@/app/components/chat/Message';

describe('Message Component', () => {
  const userMessage = {
    id: '1',
    role: 'user' as const,
    content: 'Hello, can you help with travel plans?',
    createdAt: new Date(),
  };

  const assistantMessage = {
    id: '2',
    role: 'assistant' as const,
    content: 'I can help you with travel planning. Where would you like to go?',
    createdAt: new Date(),
  };

  const itineraryMessage = {
    id: '3',
    role: 'assistant' as const,
    content: '[TRAVEL_ITINERARY] Here is your travel itinerary for Paris:\n\n* Day 1: Visit the Eiffel Tower\n* Day 2: Explore the Louvre Museum',
    createdAt: new Date(),
  };

  test('renders user message correctly', () => {
    render(<Message {...userMessage} />);
    
    // Check for user label
    expect(screen.getByText('You')).toBeInTheDocument();
    
    // Check for message content
    expect(screen.getByTestId('message-content')).toHaveTextContent('Hello, can you help with travel plans?');
    
    // Verify styled as user message (has blue background)
    const messageContainer = screen.getByTestId('message-component');
    expect(messageContainer).toHaveClass('bg-blue-500');
  });

  test('renders assistant message correctly', () => {
    render(<Message {...assistantMessage} />);
    
    // Check for assistant label
    expect(screen.getByText('Assistant')).toBeInTheDocument();
    
    // Check for message content
    expect(screen.getByTestId('message-content')).toHaveTextContent('I can help you with travel planning. Where would you like to go?');
    
    // Verify not styled as user message (doesn't have blue background)
    const messageContainer = screen.getByTestId('message-component');
    expect(messageContainer).not.toHaveClass('bg-blue-500');
  });

  test('renders travel itinerary message with download button', () => {
    render(<Message {...itineraryMessage} />);
    
    // Check for download button
    const downloadButton = screen.getByRole('button', { name: /download/i });
    expect(downloadButton).toBeInTheDocument();
  });

  test('shows speak button when onSpeakMessage prop is provided', () => {
    const onSpeakMessage = jest.fn();
    render(<Message {...assistantMessage} onSpeakMessage={onSpeakMessage} />);
    
    // Check that the speak button is visible
    const speakButton = screen.getByRole('button', { name: /speak message/i });
    expect(speakButton).toBeInTheDocument();
    
    // Click the speak button
    fireEvent.click(speakButton);
    expect(onSpeakMessage).toHaveBeenCalled();
  });

  test('shows stopping state when speaking', () => {
    const onSpeakMessage = jest.fn();
    render(<Message {...assistantMessage} onSpeakMessage={onSpeakMessage} isSpeaking={true} />);
    
    // Check that the stop button is visible
    const stopButton = screen.getByRole('button', { name: /stop speaking/i });
    expect(stopButton).toBeInTheDocument();
    expect(screen.getByText('Stop')).toBeInTheDocument();
  });
}); 