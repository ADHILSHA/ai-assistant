'use client';

import { useChatHistory, ChatHistoryItem } from '../../lib/hooks/useChatHistory';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '../../lib/redux/hooks';
import { clearAllChats, clearCurrentChat } from '../../lib/redux/chatSlice';
import { useState, useEffect } from 'react';

export default function ChatSidebar({ isOpen = false, onClose }: { isOpen?: boolean; onClose?: () => void }) {
  const { history, currentChatId, loadChat, deleteChat } = useChatHistory();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [isMobile, setIsMobile] = useState(false);

  // Add check for mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Initial check
    checkMobile();
    
    // Listen for window resize
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleSelectChat = (id: string) => {
    loadChat(id);
    // Close sidebar on mobile after selection
    if (isMobile && onClose) {
      onClose();
    }
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
    // Close sidebar on mobile after action
    if (isMobile && onClose) {
      onClose();
    }
    router.push('/chat');
  };

  const handleClearAllChats = () => {
    if (confirm('Are you sure you want to delete all chats? This action cannot be undone.')) {
      dispatch(clearAllChats());
      localStorage.removeItem('chatHistory');
      router.push('/chat');
    }
  };

  // Create a deduplicated and sorted list of chats
  const uniqueChats = [...new Map(history.map(chat => [chat.id, chat])).values()]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Determine sidebar CSS classes based on mobile state and isOpen prop
  const sidebarClasses = isMobile
    ? `fixed inset-y-0 left-0 transform ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } w-64 transition-transform duration-300 ease-in-out z-30 bg-gray-50 border-r border-gray-200 overflow-y-auto h-screen`
    : 'w-64 border-r border-gray-200 bg-gray-50 h-screen overflow-y-auto';

  // Add overlay for mobile
  const overlayClasses = isMobile && isOpen
    ? 'fixed inset-0 bg-black bg-opacity-50 z-20'
    : 'hidden';

  const sidebarContent = (
    <>
      <button
        onClick={handleNewChat}
        className="w-full cursor-pointer py-2.5 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-sm"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5v14M5 12h14"></path>
        </svg>
        New Chat
      </button>
      
      <div className="mt-4">
        <button
          onClick={handleClearAllChats}
          className="w-full cursor-pointer py-2 px-3 border border-gray-400/40 text-gray-600 text-sm rounded-lg hover:bg-gray-200/50 transition-colors flex items-center justify-center gap-1.5"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"></path>
          </svg>
          Clear All History
        </button>
      </div>
      
      {isMobile && (
        <div className="mt-4">
          <button
            onClick={onClose}
            className="w-full py-2 px-3 bg-gray-200 text-gray-800 text-sm rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center gap-1.5"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12"></path>
            </svg>
            Close Menu
          </button>
        </div>
      )}
      
      <div className="mt-6">
        <h2 className="text-sm font-medium text-gray-500 mb-2">
          Chat History ({uniqueChats.length})
        </h2>
        {uniqueChats.length === 0 ? (
          <div className="text-gray-500 text-sm text-center">
            No chat history yet
          </div>
        ) : (
          <ul className="space-y-2">
            {uniqueChats.map((chat: ChatHistoryItem) => (
              <li 
                key={`chat-${chat.id}`}
                onClick={() => handleSelectChat(chat.id)}
                className={`
                  flex justify-between items-center p-2 rounded-md cursor-pointer chat-history-item
                  ${currentChatId === chat.id 
                    ? 'active' 
                    : ''}
                `}
                style={{
                  backgroundColor: currentChatId === chat.id ? 'var(--history-active-bg)' : 'transparent',
                  color: currentChatId === chat.id ? 'var(--history-active-text)' : 'var(--foreground)'
                }}
              >
                <div className="truncate flex-1">
                  <p className="text-sm font-medium"
                     style={{ color: 'inherit' }}>{chat.title}</p>
                  <p className="text-xs opacity-75"
                     style={{ color: 'inherit' }}>
                    {new Date(chat.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <button 
                  onClick={(e) => handleDeleteChat(chat.id, e)}
                  className="text-gray-400 hover:text-red-500 p-1 cursor-pointer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 6h18"></path>
                    <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path>
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );

  return (
    <>
      {/* Backdrop overlay that closes the menu when clicked */}
      {isMobile && (
        <div 
          className={overlayClasses} 
          onClick={onClose}
        ></div>
      )}
      
      {/* Sidebar with content */}
      <div className={sidebarClasses} style={{ backgroundColor: 'var(--sidebar-bg)', borderColor: 'var(--border-color)' }}>
        <div className="p-4">
          {sidebarContent}
        </div>
      </div>
    </>
  );
} 