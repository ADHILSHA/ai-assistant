import React from 'react';
import { Message as AIMessage } from '@ai-sdk/react';

type MessageProps = AIMessage;

export default function Message({ role, content }: MessageProps) {
  const isUser = role === 'user';
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`
          max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-lg shadow
          ${isUser ? 'bg-blue-500 text-white' : 'bg-white text-gray-800 border border-gray-200'}
        `}
      >
        <span className="block text-sm font-medium mb-1 capitalize">
          {isUser ? 'You' : 'Assistant'}
        </span>
        <div className="text-sm whitespace-pre-wrap">{content}</div>
      </div>
    </div>
  );
} 