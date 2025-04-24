'use client';

import Link from 'next/link';
import { useChatHistory, ChatHistoryItem } from './lib/hooks/useChatHistory';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const { history, deleteChat } = useChatHistory();
  const router = useRouter();

  const handleStartNewChat = () => {
    router.push('/chat');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900">AI Chat Assistant</h1>
          <p className="mt-1 text-lg text-gray-600">Your virtual travel and gift recommendation assistant</p>
        </div>
      </header>

      <main className="flex-grow max-w-7xl mx-auto py-12 px-6 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <button
            onClick={handleStartNewChat}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium text-lg shadow-md"
          >
            Start a New Chat
          </button>
        </div>

        {history.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Recent Conversations</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {history.map((chat: ChatHistoryItem) => (
                <div
                  key={chat.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="p-5 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800 truncate">
                      {chat.title}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(chat.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="p-4 text-sm text-gray-600 bg-gray-50">
                    <p className="truncate">
                      {chat.messages[0].content}
                    </p>
                  </div>
                  <div className="flex p-4 bg-white justify-between">
                    <Link
                      href={`/chat`}
                      className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                    >
                      Continue Chat
                    </Link>
                    <button
                      onClick={() => deleteChat(chat.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
          © {new Date().getFullYear()} AI Chat Assistant - All rights reserved
        </div>
      </footer>
    </div>
  );
}
