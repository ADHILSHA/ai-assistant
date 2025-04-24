import React from 'react';
import { Message as AIMessage } from '@ai-sdk/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type MessageProps = AIMessage;

// Define the props type for markdown components
interface MarkdownComponentProps {
  node?: any;
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export default function Message({ role, content }: MessageProps) {
  const isUser = role === 'user';
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`
          max-w-md md:max-w-lg lg:max-w-2xl px-4 py-3 rounded-lg shadow
          ${isUser ? 'bg-blue-500 text-white' : 'bg-white text-gray-800 border border-gray-200'}
        `}
      >
        <span className="block text-sm font-medium mb-2 capitalize">
          {isUser ? 'You' : 'Assistant'}
        </span>
        <div className={`text-sm ${isUser ? 'prose-invert' : 'prose'} prose-sm max-w-none`}>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({node, ...props}: MarkdownComponentProps) => <h1 className="text-lg font-bold mt-3 mb-2" {...props} />,
              h2: ({node, ...props}: MarkdownComponentProps) => <h2 className="text-base font-bold mt-3 mb-2" {...props} />,
              h3: ({node, ...props}: MarkdownComponentProps) => <h3 className="text-sm font-bold mt-2 mb-1" {...props} />,
              p: ({node, ...props}: MarkdownComponentProps) => <p className="my-1" {...props} />,
              ul: ({node, ...props}: MarkdownComponentProps) => <ul className="list-disc pl-5 my-2" {...props} />,
              ol: ({node, ...props}: MarkdownComponentProps) => <ol className="list-decimal pl-5 my-2" {...props} />,
              li: ({node, ...props}: MarkdownComponentProps) => <li className="my-1" {...props} />,
              a: ({node, ...props}: MarkdownComponentProps) => <a className={`${isUser ? 'text-blue-200' : 'text-blue-600'} hover:underline`} {...props} />,
              strong: ({node, ...props}: MarkdownComponentProps) => <strong className="font-bold" {...props} />,
              blockquote: ({node, ...props}: MarkdownComponentProps) => <blockquote className="border-l-4 border-gray-300 pl-3 my-2" {...props} />,
              code: ({node, inline, ...props}: MarkdownComponentProps) => 
                inline 
                  ? <code className={`px-1 py-0.5 rounded ${isUser ? 'bg-blue-600 text-blue-100' : 'bg-gray-100 text-gray-800'}`} {...props} />
                  : <code className={`block p-2 rounded my-2 ${isUser ? 'bg-blue-600 text-blue-100' : 'bg-gray-100 text-gray-800'}`} {...props} />,
              pre: ({node, ...props}: MarkdownComponentProps) => <pre className={`rounded p-0 my-2 ${isUser ? 'bg-blue-600' : 'bg-gray-100'}`} {...props} />,
              hr: ({node, ...props}: MarkdownComponentProps) => <hr className="my-3 border-t border-gray-300" {...props} />,
              table: ({node, ...props}: MarkdownComponentProps) => <table className="border-collapse table-auto w-full text-xs my-2" {...props} />,
              th: ({node, ...props}: MarkdownComponentProps) => <th className={`border py-1 px-2 ${isUser ? 'border-blue-400' : 'border-gray-300'}`} {...props} />,
              td: ({node, ...props}: MarkdownComponentProps) => <td className={`border py-1 px-2 ${isUser ? 'border-blue-400' : 'border-gray-300'}`} {...props} />
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
} 