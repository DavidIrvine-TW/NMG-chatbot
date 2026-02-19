'use client';

import type { Message } from '@/types/chat';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './MessageBubble.css';

interface MessageBubbleProps {
  message: Message;
  onRetry?: (id: string) => void;
}

export default function MessageBubble({ message, onRetry }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const type = isUser ? 'user' : 'bot';
  const isError = message.status === 'error';

  const formattedTime = (() => {
    try {
      const d = new Date(message.timestamp);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  })();

  return (
    <div className={`message-wrapper ${type}`} role="listitem">
      {!isUser && (
        <svg
          className="bot-avatar"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7v1h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1v-1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2zM9 14a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm6 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2z" />
        </svg>
      )}
      <div className={`message-bubble ${type} ${isError ? 'error' : ''}`}>
        {isUser ? (
          <p className="message-text">{message.content}</p>
        ) : (
          <div className="message-text markdown-content">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.content}
            </ReactMarkdown>
          </div>
        )}
        <div className="message-meta">
          {formattedTime && (
            <span className="message-time">{formattedTime}</span>
          )}
          {isError && onRetry && (
            <button
              className="retry-btn"
              onClick={() => onRetry(message.id)}
              aria-label="Retry message"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <polyline points="23 4 23 10 17 10" />
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
              </svg>
              Retry
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
