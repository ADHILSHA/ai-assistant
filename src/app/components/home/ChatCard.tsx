'use client';

import { ChatHistoryItem } from '../../lib/hooks/useChatHistory';

interface ChatCardProps {
  chat: ChatHistoryItem;
  onContinueChat: (chatId: string) => void;
  onDeleteChat: (chatId: string) => void;
}

export default function ChatCard({ chat, onContinueChat, onDeleteChat }: ChatCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div 
        className="p-5 border-b border-gray-200 dark:border-gray-700 cursor-pointer w-full"
        onClick={() => onContinueChat(chat.id)}
      >
        <div className="w-full">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 truncate w-full">
            {chat.title}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {new Date(chat.createdAt).toLocaleString()}
          </p>
        </div>
      </div>
      <div 
        className="p-4 text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 cursor-pointer w-full"
        onClick={() => onContinueChat(chat.id)}
      >
        <p className="truncate w-full">
          {chat.messages[0].content}
        </p>
      </div>
      <div className="flex p-4 bg-white dark:bg-gray-800 justify-between">
        <button
          onClick={() => onContinueChat(chat.id)}
          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium text-sm cursor-pointer"
        >
          Continue Chat
        </button>
        <button
          onClick={() => onDeleteChat(chat.id)}
          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-sm cursor-pointer"
        >
          Delete
        </button>
      </div>
    </div>
  );
} 