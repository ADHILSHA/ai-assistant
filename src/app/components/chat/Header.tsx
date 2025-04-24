'use client';

import Link from 'next/link';
import { useChatHistory } from '../../lib/hooks/useChatHistory';
import { useEffect, useState } from 'react';
import ThemeToggle from '../ThemeToggle';

interface HeaderProps {
  onToggleSidebar?: () => void;
  isHomePage?: boolean;
}

export default function Header({ onToggleSidebar, isHomePage = false }: HeaderProps) {
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
    <header 
      className="p-4 bg-white border-b border-gray-200 shadow-sm flex justify-between items-center flex-shrink-0 h-16"
      style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)', color: 'var(--foreground)' }}
    >
      <div className="flex items-center min-w-0">
        {isMobile && onToggleSidebar && (
          <button 
            onClick={onToggleSidebar}
            className="mr-2 p-1 flex-shrink-0 rounded-md hover:bg-gray-100"
            aria-label="Toggle menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-800">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
        )}
        <h1 className="text-xl font-bold text-gray-800 truncate">
          {isMobile ? "AI Chat" : "AI Chat Assistant"}
        </h1>
      </div>
      <div className="flex items-center ml-2 flex-shrink-0">
        <div className="mr-2 text-sm text-gray-600 whitespace-nowrap">
          {history.length} {history.length === 1 ? 'chat' : 'chats'} saved
        </div>
        <ThemeToggle />
        {!isHomePage && (
          <Link
            href="/"
            className="ml-2 p-2 rounded-md hover:bg-gray-100 text-gray-700"
            aria-label="Go to home page"
            title="Home"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
          </Link>
        )}
      </div>
    </header>
  );
} 