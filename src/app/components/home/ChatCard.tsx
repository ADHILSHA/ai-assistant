'use client';

import { ChatHistoryItem } from '../../lib/hooks/useChatHistory';

interface ChatCardProps {
  chat: ChatHistoryItem;
  onContinueChat: (chatId: string) => void;
  onDeleteChat: (chatId: string) => void;
}

export default function ChatCard({ chat, onContinueChat, onDeleteChat }: ChatCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div 
        className="p-5 border-b border-gray-200 cursor-pointer w-full"
        onClick={() => onContinueChat(chat.id)}
      >
        <div className="w-full">
          <h3 className="text-lg font-semibold text-gray-800 truncate w-full">
            {chat.title}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {new Date(chat.createdAt).toLocaleString()}
          </p>
        </div>
      </div>
      <div 
        className="p-4 text-sm text-gray-600 bg-gray-50 cursor-pointer w-full"
        onClick={() => onContinueChat(chat.id)}
      >
        <p className="truncate w-full">
          {chat.messages[0].content}
        </p>
      </div>
      <div className="flex p-4 bg-white justify-between">
        <button
          onClick={() => onContinueChat(chat.id)}
          className="text-blue-600 hover:text-blue-800 font-medium text-sm cursor-pointer"
        >
          Continue Chat
        </button>
        <button
          onClick={() => onDeleteChat(chat.id)}
          className="text-red-600 hover:text-red-800 text-sm cursor-pointer"
        >
          Delete
        </button>
      </div>
    </div>
  );
} 