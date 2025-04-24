'use client';

import Link from 'next/link';
import { useChatHistory } from '../../lib/hooks/useChatHistory';
import { useEffect, useState } from 'react';

export default function Header({ onToggleSidebar }: { onToggleSidebar?: () => void }) {
  const { history } = useChatHistory();
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
  
  return (
    <header className="p-4 bg-white border-b border-gray-200 shadow-sm flex justify-between items-center flex-shrink-0 h-16">
      <div className="flex items-center">
        {isMobile && onToggleSidebar && (
          <button 
            onClick={onToggleSidebar}
            className="mr-3 p-1 rounded-md hover:bg-gray-100"
            aria-label="Toggle menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
        )}
        <h1 className="text-xl font-bold text-gray-800">AI Chat Assistant</h1>
      </div>
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