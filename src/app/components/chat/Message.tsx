import React, { useRef, useState, useEffect, memo } from 'react';
import { Message as AIMessage } from '@ai-sdk/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { containsItinerary, generatePdfFromElement } from '@/app/lib/pdf-utils';
import { FaVolumeUp, FaVolumeMute, FaFileDownload } from 'react-icons/fa';

interface MessageProps extends AIMessage {
  onSpeakMessage?: () => void;
  isSpeaking?: boolean;
}

// Define the props type for markdown components
interface MarkdownComponentProps {
  node?: any;
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
}

function MessageComponent({ role, content, onSpeakMessage, isSpeaking, id }: MessageProps) {
  const isUser = role === 'user';
  const contentRef = useRef<HTMLDivElement>(null);
  const [showDownloadButton, setShowDownloadButton] = useState(false);
  const [displayContent, setDisplayContent] = useState(content);
  const messageCheckedRef = useRef(false);
  
  // Process content to hide the marker and detect itinerary
  useEffect(() => {
    if (!isUser && content) {
      // Check for marker and remove it from display content
      if (content.includes("[TRAVEL_ITINERARY]")) {
        setShowDownloadButton(true);
        setDisplayContent(content.replace("[TRAVEL_ITINERARY]", ""));
      } else {
        setDisplayContent(content);
        
        // Only perform itinerary detection once per message
        if (!messageCheckedRef.current) {
          messageCheckedRef.current = true;
          if (containsItinerary(content)) {
            setShowDownloadButton(true);
          }
        }
      }
    }
  }, [content, isUser]);
  
  // Handle PDF download
  const handleDownload = async () => {
    if (contentRef.current) {
      try {
        await generatePdfFromElement(contentRef.current, 'Travel Itinerary');
      } catch (err) {
        console.error('Failed to generate PDF:', err);
      }
    }
  };
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`
          max-w-xs md:max-w-md lg:max-w-2xl px-4 py-3 rounded-lg shadow
          ${isUser ? 'bg-blue-500 text-white' : 'bg-white text-gray-800 border border-gray-200'}
          ${!isUser && (showDownloadButton || onSpeakMessage) ? 'relative pb-12' : ''}
          overflow-hidden break-words
        `}
      >
        <span className="block text-sm font-medium mb-2 capitalize">
          {isUser ? 'You' : 'Assistant'}
        </span>
        <div 
          ref={contentRef}
          className={`text-sm ${isUser ? 'prose-invert' : 'prose'} prose-sm max-w-none break-words`}
          style={{ wordWrap: 'break-word' }}
        >
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
                  : <code className={`block p-2 rounded my-2 ${isUser ? 'bg-blue-600 text-blue-100' : 'bg-gray-100 text-gray-800'} overflow-x-auto`} {...props} />,
              pre: ({node, ...props}: MarkdownComponentProps) => <pre className={`rounded p-0 my-2 ${isUser ? 'bg-blue-600' : 'bg-gray-100'} overflow-x-auto`} {...props} />,
              hr: ({node, ...props}: MarkdownComponentProps) => <hr className="my-3 border-t border-gray-300" {...props} />,
              table: ({node, ...props}: MarkdownComponentProps) => <table className="border-collapse table-auto w-full text-xs my-2" {...props} />,
              th: ({node, ...props}: MarkdownComponentProps) => <th className={`border py-1 px-2 ${isUser ? 'border-blue-400' : 'border-gray-300'}`} {...props} />,
              td: ({node, ...props}: MarkdownComponentProps) => <td className={`border py-1 px-2 ${isUser ? 'border-blue-400' : 'border-gray-300'}`} {...props} />
            }}
          >
            {displayContent}
          </ReactMarkdown>
        </div>
        
        {/* Buttons container for assistant messages */}
        {!isUser && (
          <div className="absolute bottom-3 right-3 flex space-x-2">
            {/* Speak button */}
            {onSpeakMessage && (
              <button
                onClick={onSpeakMessage}
                className={`px-3 py-1.5 text-white text-xs rounded-md flex items-center ${
                  isSpeaking ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
                }`}
                aria-label={isSpeaking ? "Stop speaking" : "Speak message"}
                title={isSpeaking ? "Stop speaking" : "Speak message"}
              >
                {isSpeaking ? <FaVolumeMute className="h-4 w-4" /> : <FaVolumeUp className="h-4 w-4" />}
                <span className="ml-1">{isSpeaking ? 'Stop' : 'Speak'}</span>
              </button>
            )}
            
            {/* Download as PDF button (only show for assistant messages with itineraries) */}
            {showDownloadButton && (
              <button
                onClick={handleDownload}
                className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 flex items-center"
                aria-label="Download as PDF"
                title="Download as PDF"
              >
                <FaFileDownload className="h-4 w-4 mr-1" />
                <span>Download</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Use memo to prevent unnecessary re-renders
const Message = memo(MessageComponent);
export default Message; 