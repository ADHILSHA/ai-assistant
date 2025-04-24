export default function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-6">
      <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 dark:text-gray-400 text-sm">
        © {new Date().getFullYear()} AI Chat Assistant - All rights reserved
      </div>
    </footer>
  );
} 