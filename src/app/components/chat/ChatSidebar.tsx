'use client';

import { useChatHistory, ChatHistoryItem } from '../../lib/hooks/useChatHistory';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '../../lib/redux/hooks';
import { clearAllChats, clearCurrentChat } from '../../lib/redux/chatSlice';

export default function ChatSidebar() {
  const { history, currentChatId, loadChat, deleteChat } = useChatHistory();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const handleSelectChat = (id: string) => {
    loadChat(id);
    // Ensure we're on the chat page
    router.push('/chat');
  };

  const handleDeleteChat = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteChat(id);
  };

  const handleNewChat = () => {
    // Use the dedicated action instead of manually dispatching
    dispatch(clearCurrentChat());
    router.push('/chat');
  };

  const handleClearAllChats = () => {
    if (confirm('Are you sure you want to delete all chats? This action cannot be undone.')) {
      dispatch(clearAllChats());
      localStorage.removeItem('chatHistory');
      router.push('/chat');
    }
  };

  if (history.length === 0) {
    return (
      <div className="w-64 p-4 border-r border-gray-200 bg-gray-50 h-screen">
        <button
          onClick={handleNewChat}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          New Chat
        </button>
        <div className="mt-4 text-gray-500 text-sm text-center">
          No chat history yet
        </div>
      </div>
    );
  }

  // Create a deduplicated list to avoid React key errors
  const uniqueChats = [...new Map(history.map(chat => [chat.id, chat])).values()];

  return (
    <div className="w-64 p-4 border-r border-gray-200 bg-gray-50 h-screen overflow-y-auto">
      <button
        onClick={handleNewChat}
        className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
      >
        New Chat
      </button>
      
      <div className="mt-4">
        <button
          onClick={handleClearAllChats}
          className="w-full py-1 px-2 bg-red-500 text-white text-sm rounded-md hover:bg-red-600"
        >
          Clear All History
        </button>
      </div>
      
      <div className="mt-6">
        <h2 className="text-sm font-medium text-gray-500 mb-2">
          Chat History ({uniqueChats.length})
        </h2>
        <ul className="space-y-2">
          {uniqueChats.map((chat: ChatHistoryItem) => (
            <li 
              key={`chat-${chat.id}`}
              onClick={() => handleSelectChat(chat.id)}
              className={`
                flex justify-between items-center p-2 rounded-md cursor-pointer
                ${currentChatId === chat.id ? 'bg-blue-100' : 'hover:bg-gray-100'}
              `}
            >
              <div className="truncate flex-1">
                <p className="text-sm font-medium">{chat.title}</p>
                <p className="text-xs text-gray-500">
                  {new Date(chat.createdAt).toLocaleDateString()}
                </p>
              </div>
              <button 
                onClick={(e) => handleDeleteChat(chat.id, e)}
                className="text-gray-400 hover:text-red-500 p-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18"></path>
                  <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path>
                </svg>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
} 