'use client';

import Link from 'next/link';
import { useChatHistory } from '../../lib/hooks/useChatHistory';

export default function Header() {
  const { history } = useChatHistory();
  
  return (
    <header className="p-4 bg-white border-b border-gray-200 shadow-sm flex justify-between items-center">
      <h1 className="text-xl font-bold text-gray-800">AI Chat Assistant</h1>
      <div className="flex items-center">
        <div className="mr-3 text-sm text-gray-600">
          {history.length} {history.length === 1 ? 'chat' : 'chats'} saved
        </div>
        <Link
          href="/"
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          Home
        </Link>
      </div>
    </header>
  );
} 