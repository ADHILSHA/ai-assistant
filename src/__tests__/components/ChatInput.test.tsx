import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ChatInput from '@/app/components/chat/ChatInput';

// Mock the voice recognition hook
jest.mock('@/lib/hooks/useVoiceRecognition', () => ({
  useVoiceRecognition: () => ({
    isListening: false,
    toggleListening: jest.fn(),
    transcript: '',
    isSupported: true,
  }),
}));

describe('ChatInput Component', () => {
  const defaultProps = {
    input: '',
    isLoading: false,
    handleInputChange: jest.fn(),
    handleSubmit: jest.fn(),
    setInput: jest.fn(),
  };

  test('renders ChatInput component', () => {
    render(<ChatInput {...defaultProps} />);
    
    // Check input field is present
    const inputElement = screen.getByPlaceholderText(/Type your message or use the buttons above/i);
    expect(inputElement).toBeInTheDocument();
    
    // Check send button is present
    const sendButton = screen.getByRole('button', { name: /send/i });
    expect(sendButton).toBeInTheDocument();
    
    // Check voice button is present
    const voiceButton = screen.getByRole('button', { name: /start voice input/i });
    expect(voiceButton).toBeInTheDocument();
  });

  test('input field value changes when typed into', () => {
    const handleInputChange = jest.fn();
    render(<ChatInput {...defaultProps} handleInputChange={handleInputChange} />);
    
    const inputElement = screen.getByPlaceholderText(/Type your message or use the buttons above/i);
    fireEvent.change(inputElement, { target: { value: 'Hello' } });
    
    expect(handleInputChange).toHaveBeenCalled();
  });

  test('form submission is triggered when send button is clicked', () => {
    const handleSubmit = jest.fn((e) => e.preventDefault());
    render(<ChatInput {...defaultProps} input="Test message" handleSubmit={handleSubmit} />);
    
    const sendButton = screen.getByRole('button', { name: /send/i });
    fireEvent.click(sendButton);
    
    expect(handleSubmit).toHaveBeenCalled();
  });

  test('send button is disabled when input is empty', () => {
    render(<ChatInput {...defaultProps} input="" />);
    
    const sendButton = screen.getByRole('button', { name: /send/i });
    expect(sendButton).toBeDisabled();
  });

  test('send button is enabled when input has content', () => {
    render(<ChatInput {...defaultProps} input="Hello" />);
    
    const sendButton = screen.getByRole('button', { name: /send/i });
    expect(sendButton).not.toBeDisabled();
  });

  test('input is disabled when message is loading', () => {
    render(<ChatInput {...defaultProps} isLoading={true} />);
    
    const inputElement = screen.getByPlaceholderText(/Type your message or use the buttons above/i);
    expect(inputElement).toBeDisabled();
  });
}); 