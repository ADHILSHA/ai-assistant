'use client';

import { ChatHistoryItem } from '../../lib/hooks/useChatHistory';
import ChatCard from './ChatCard';

interface ChatListProps {
  history: ChatHistoryItem[];
  onContinueChat: (chatId: string) => void;
  onDeleteChat: (chatId: string) => void;
}

export default function ChatList({ history, onContinueChat, onDeleteChat }: ChatListProps) {
  if (history.length === 0) {
    return null;
  }
  
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Recent Conversations</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {history.map((chat: ChatHistoryItem) => (
          <ChatCard
            key={chat.id}
            chat={chat}
            onContinueChat={onContinueChat}
            onDeleteChat={onDeleteChat}
          />
        ))}
      </div>
    </div>
  );
} 