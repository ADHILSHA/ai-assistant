import React, { FormEvent, ChangeEvent } from 'react';

type ChatInputProps = {
  input: string;
  isLoading: boolean;
  handleInputChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: FormEvent<HTMLFormElement>) => void;
};

export default function ChatInput({
  input,
  isLoading,
  handleInputChange,
  handleSubmit,
}: ChatInputProps) {
  return (
    <form onSubmit={handleSubmit} className="flex items-center space-x-2">
      <input
        className="flex-grow w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        value={input}
        placeholder="Ask about travel plans or gift ideas..."
        onChange={handleInputChange}
        disabled={isLoading}
        aria-label="Chat input"
      />
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