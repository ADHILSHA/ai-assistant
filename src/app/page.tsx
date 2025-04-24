'use client';

import { useRouter } from 'next/navigation';
import { useChatHistory } from './lib/hooks/useChatHistory';
import Header from './components/chat/Header';
import ActionButton from './components/home/ActionButton';
import ChatList from './components/home/ChatList';
import Footer from './components/home/Footer';
import { useAppDispatch } from './lib/redux/hooks';
import { loadChat } from './lib/redux/chatSlice';

export default function HomePage() {
  const { history, deleteChat } = useChatHistory();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const handleStartNewChat = () => {
    router.push('/chat');
  };

  // This uses the dispatch directly to ensure state is updated before navigation
  const handleContinueChat = (chatId: string) => {
    // Dispatch directly to ensure state change happens before navigation
    dispatch(loadChat(chatId));
    // Add a small delay to ensure redux state updates before navigation
    setTimeout(() => {
      router.push('/chat');
    }, 50);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header isHomePage={true} />

      <main className="flex-grow max-w-7xl mx-auto py-12 px-6 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4" style={{ color: 'var(--foreground)' }}>
            Your Personal Recommendation Assistant ✨
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8" style={{ color: 'var(--foreground)' }}>
            Get personalized suggestions for travel itineraries, gift ideas, and more!
          </p>
          <ActionButton 
            onClick={handleStartNewChat} 
            label="Start a New Chat" 
            icon="✉️"
          />
        </div>

        {history.length === 0 ? (
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition cursor-pointer" onClick={() => router.push('/chat')}>
              <div className="text-3xl mb-4">✈️</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900" style={{ color: 'var(--foreground)' }}>Travel Itineraries</h3>
              <p className="text-gray-600" style={{ color: 'var(--foreground)' }}>
                Get customized travel plans for any destination. Just tell me where you want to go!
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition cursor-pointer" onClick={() => router.push('/chat')}>
              <div className="text-3xl mb-4">🎁</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900" style={{ color: 'var(--foreground)' }}>Gift Recommendations</h3>
              <p className="text-gray-600" style={{ color: 'var(--foreground)' }}>
                Find the perfect gift for any occasion, person, or budget.
              </p>
            </div>
          </div>
        ) : (
          <ChatList 
            history={history}
            onContinueChat={handleContinueChat}
            onDeleteChat={deleteChat}
          />
        )}
      </main>

      <Footer />
    </div>
  );
}
