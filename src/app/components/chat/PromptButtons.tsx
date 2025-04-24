'use client';

import React from 'react';

type PromptButtonsProps = {
  onSelectPrompt: (prompt: string) => void;
};

interface PromptOption {
  text: string;
  prompt: string;
  emoji: string;
}

export default function PromptButtons({ onSelectPrompt }: PromptButtonsProps) {
  const promptOptions: PromptOption[] = [
    {
      text: "Travel Planning",
      prompt: "I need help planning a vacation. Can you suggest some destinations and travel tips?",
      emoji: "✈️"
    },
    {
      text: "Gift Ideas",
      prompt: "I'm looking for gift ideas for a special occasion. Can you help me?",
      emoji: "🎁"
    }
  ];

  return (
    <div className="flex flex-col items-center space-y-4 my-6 max-w-md mx-auto">
      <h2 className="text-lg font-medium text-gray-700 dark:text-gray-300">
        How can I help you today? 👋
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
        {promptOptions.map((option, index) => (
          <button
            key={`prompt-${index}`}
            onClick={() => onSelectPrompt(option.prompt)}
            className="flex cursor-pointer items-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:border-blue-200 dark:hover:border-blue-800 transition-colors text-left shadow-sm bg-white dark:bg-gray-800"
          >
            <span className="text-xl mr-3">{option.emoji}</span>
            <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{option.text}</span>
          </button>
        ))}
      </div>
    </div>
  );
} 