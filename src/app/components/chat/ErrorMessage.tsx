import React from 'react';

type ErrorMessageProps = {
  message: string;
};

export default function ErrorMessage({ message }: ErrorMessageProps) {
  if (!message) return null;
  
  return (
    <div className="mb-2 p-2 text-center text-red-600 bg-red-100 border border-red-300 rounded-md text-sm">
      <p>Error: {message}</p>
    </div>
  );
} 