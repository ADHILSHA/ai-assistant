'use client';

interface ActionButtonProps {
  onClick: () => void;
  label: string;
  icon?: string;
}

export default function ActionButton({ onClick, label, icon }: ActionButtonProps) {
  return (
    <div className="text-center mb-12">
      <button
        onClick={onClick}
        className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg 
                  hover:from-blue-700 hover:to-indigo-700 font-medium text-lg shadow-lg
                  transform transition hover:scale-105 flex items-center mx-auto cursor-pointer"
      >
        {icon && <span className="mr-2">{icon}</span>}
        {label}
        <span className="ml-2">→</span>
      </button>
    </div>
  );
} 