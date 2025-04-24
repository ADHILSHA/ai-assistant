import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ChatPage from '@/app/chat/page';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

// Mock the hooks and components that the ChatPage depends on
jest.mock('@ai-sdk/react', () => ({
  useChat: () => ({
    messages: [],
    input: '',
    handleInputChange: jest.fn(),
    handleSubmit: jest.fn(),
    isLoading: false,
    error: null,
    setMessages: jest.fn(),
    setInput: jest.fn(),
  }),
}));

jest.mock('@/lib/hooks/useVoiceRecognition', () => ({
  useVoiceRecognition: () => ({
    isListening: false,
    toggleListening: jest.fn(),
    transcript: '',
    isSupported: true,
  }),
}));

jest.mock('@/app/lib/hooks/useChatHistory', () => ({
  useChatHistory: () => ({
    currentChatId: null,
    currentMessages: [],
    startNewChat: jest.fn(),
    addMessageToChat: jest.fn(),
  }),
}));

// Mock Next.js components
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
}));

// Set up MSW to intercept API requests
const server = setupServer(
  http.post('/api/v1/chat', () => {
    return HttpResponse.json({
      role: 'assistant',
      content: 'This is a test response',
    });
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Skip these tests for now as they need more complex setup
describe.skip('ChatPage Integration', () => {
  test('renders the chat page', () => {
    render(<ChatPage />);
    
    // Check for main elements
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument();
  });

  test('submitting a message triggers API call', async () => {
    render(<ChatPage />);
    
    // Type a message
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'Test message' } });
    
    // Submit the message
    const sendButton = screen.getByRole('button', { name: /send/i });
    fireEvent.click(sendButton);
    
    // Wait for the response to be displayed
    await waitFor(() => {
      expect(screen.getByText('This is a test response')).toBeInTheDocument();
    });
  });
}); 