'use client';

import { useEffect, useRef } from 'react';
import type { Message } from '@/types/chat';
import MessageBubble from '../MessageBubble/MessageBubble';
import ChatInput from '../ChatInput/ChatInput';
import './ChatWindow.css';

const STARTER_QUESTIONS = [
  'What can you help me with?',
  'Tell me something interesting',
  'How does this chat work?',
  'What are your capabilities?',
];

interface ChatWindowProps {
  messages: Message[];
  onSendMessage: (content: string) => void;
  onClearChat: () => void;
  onRetryMessage: (id: string) => void;
  isLoading: boolean;
}

export default function ChatWindow({
  messages,
  onSendMessage,
  onClearChat,
  onRetryMessage,
  isLoading,
}: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div className="chat-window" role="main" aria-label="Chat window">
      <div className="chat-messages" role="list" aria-label="Messages">
        {messages.length === 0 ? (
          <div className="chat-messages-empty">
            <div className="starter-section">
              <h2 className="starter-title">AI Chat</h2>
              <p className="starter-subtitle">
                Ask me anything to get started
              </p>
              <div className="starter-questions">
                {STARTER_QUESTIONS.map((question) => (
                  <button
                    key={question}
                    className="starter-btn"
                    onClick={() => onSendMessage(question)}
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                onRetry={msg.status === 'error' ? onRetryMessage : undefined}
              />
            ))}
          </>
        )}

        {isLoading && messages[messages.length - 1]?.status !== 'sending' && (
          <div className="typing-indicator" aria-label="Assistant is typing">
            <svg
              className="typing-avatar"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7v1h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1v-1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2zM9 14a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm6 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2z" />
            </svg>
            <div className="typing-bubble">
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-dot" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-wrapper">
        <div className="chat-input-row">
          <ChatInput onSend={onSendMessage} disabled={isLoading} />
          {messages.length > 0 && (
            <button
              className="clear-chat-btn"
              onClick={onClearChat}
              title="Clear chat"
              disabled={isLoading}
              aria-label="Clear chat"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
