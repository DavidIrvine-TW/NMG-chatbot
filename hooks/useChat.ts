'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Message, Conversation } from '@/types/chat';
import { sendMessageStream } from '@/lib/api';

const STORAGE_KEY = 'aichat_conversations';
const ACTIVE_KEY = 'aichat_active_id';

function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
}

export function useChat() {
  const [conversations, setConversations] = useState<Conversation[]>(() =>
    loadFromStorage(STORAGE_KEY, [])
  );
  const [activeConversationId, setActiveConversationId] = useState<string | null>(() =>
    loadFromStorage(ACTIVE_KEY, null)
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = useCallback(() => setSidebarOpen((p) => !p), []);

  // Persist conversations
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
  }, [conversations]);

  // Persist active ID
  useEffect(() => {
    if (activeConversationId) {
      localStorage.setItem(ACTIVE_KEY, JSON.stringify(activeConversationId));
    } else {
      localStorage.removeItem(ACTIVE_KEY);
    }
  }, [activeConversationId]);

  // Load messages when switching conversations
  useEffect(() => {
    const conv = conversations.find((c) => c.id === activeConversationId);
    setMessages(conv?.messages ?? []);
  }, [activeConversationId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-clear toastyerror after 5s
  useEffect(() => {
    if (!error) return;
    const t = setTimeout(() => setError(null), 5000);
    return () => clearTimeout(t);
  }, [error]);

  const handleNewChat = useCallback(() => {
    const conv: Conversation = {
      id: Date.now().toString(),
      title: 'New conversation',
      messages: [],
    };
    setConversations((prev) => [conv, ...prev]);
    setActiveConversationId(conv.id);
    setMessages([]);
  }, []);

  const handleSelectChat = useCallback((id: string) => {
    setActiveConversationId(id);
  }, []);

  const handleEditChat = useCallback((id: string, newTitle: string) => {
    if (!newTitle.trim()) return;
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title: newTitle.trim() } : c))
    );
  }, []);

  const handleDeleteChat = useCallback(
    (id: string) => {
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (activeConversationId === id) {
        setActiveConversationId(null);
        setMessages([]);
      }
    },
    [activeConversationId]
  );

  const handleClearChat = useCallback(() => {
    if (!activeConversationId) return;
    setMessages([]);
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConversationId
          ? { ...c, messages: [], title: 'New conversation' }
          : c
      )
    );
  }, [activeConversationId]);

  const handleSendMessage = useCallback(
    async (content: string) => {
      let currentId = activeConversationId;

      // Create conversation if none active
      if (!currentId) {
        const conv: Conversation = {
          id: Date.now().toString(),
          title: content.slice(0, 30) + (content.length > 30 ? '...' : ''),
          messages: [],
        };
        setConversations((prev) => [conv, ...prev]);
        currentId = conv.id;
        setActiveConversationId(currentId);
      }

      const userMsg: Message = {
        id: `msg_${Date.now()}_user`,
        role: 'user',
        content,
        timestamp: new Date().toISOString(),
        status: 'sent',
      };

      const updatedMessages = [...messages, userMsg];
      setMessages(updatedMessages);

      // Update title on first message
      if (messages.length === 0) {
        setConversations((prev) =>
          prev.map((c) =>
            c.id === currentId
              ? { ...c, title: content.slice(0, 30) + (content.length > 30 ? '...' : '') }
              : c
          )
        );
      }

      // Add placeholder for streaming assistant message
      const assistantMsgId = `msg_${Date.now()}_assistant`;
      const placeholderMsg: Message = {
        id: assistantMsgId,
        role: 'assistant',
        content: '',
        timestamp: new Date().toISOString(),
        status: 'sending',
      };

      const messagesWithPlaceholder = [...updatedMessages, placeholderMsg];
      setMessages(messagesWithPlaceholder);
      setIsLoading(true);
      setError(null);

      // Find conversation to get conversationId
      const conv = conversations.find((c) => c.id === currentId);

      const result = await sendMessageStream(
        content,
        conv?.conversationId,
        (streamedText) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsgId ? { ...m, content: streamedText } : m
            )
          );
        }
      );

      setIsLoading(false);

      if (result.success) {
        const finalMsg: Message = {
          id: result.data.id,
          role: 'assistant',
          content: result.data.content,
          timestamp: result.data.timestamp,
          status: 'sent',
        };

        setMessages((prev) => {
          const final = prev.map((m) =>
            m.id === assistantMsgId ? finalMsg : m
          );
          // Persist to conversations
          setConversations((convs) =>
            convs.map((c) =>
              c.id === currentId
                ? { ...c, messages: final, conversationId: result.data.conversationId }
                : c
            )
          );
          return final;
        });
      } else {
        // Mark assistant message as error
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsgId
              ? { ...m, content: result.error, status: 'error' }
              : m
          )
        );
        setError(result.error);
      }
    },
    [activeConversationId, messages, conversations]
  );

  const handleRetryMessage = useCallback(
    async (messageId: string) => {
      // Find the user message that preceded the failed assistant message
      const idx = messages.findIndex((m) => m.id === messageId);
      if (idx < 0) return;

      // If it's a failed assistant message, find the user message before it
      const failedMsg = messages[idx];
      if (failedMsg.role === 'assistant' && failedMsg.status === 'error') {
        // Remove the failed message
        const withoutFailed = messages.filter((m) => m.id !== messageId);
        setMessages(withoutFailed);

        // Find the last user message before this one
        const prevUserMsg = messages
          .slice(0, idx)
          .reverse()
          .find((m) => m.role === 'user');

        if (prevUserMsg) {
          // We need to temporarily set messages without the failed one,
          // then re-send
          const trimmedMessages = withoutFailed;
          setMessages(trimmedMessages);

          // Re-trigger send with same user content
          // Build a temporary state and call the stream
          const currentId = activeConversationId;
          if (!currentId) return;

          const assistantMsgId = `msg_${Date.now()}_assistant`;
          const placeholderMsg: Message = {
            id: assistantMsgId,
            role: 'assistant',
            content: '',
            timestamp: new Date().toISOString(),
            status: 'sending',
          };

          setMessages([...trimmedMessages, placeholderMsg]);
          setIsLoading(true);
          setError(null);

          const conv = conversations.find((c) => c.id === currentId);

          const result = await sendMessageStream(
            prevUserMsg.content,
            conv?.conversationId,
            (streamedText) => {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantMsgId ? { ...m, content: streamedText } : m
                )
              );
            }
          );

          setIsLoading(false);

          if (result.success) {
            const finalMsg: Message = {
              id: result.data.id,
              role: 'assistant',
              content: result.data.content,
              timestamp: result.data.timestamp,
              status: 'sent',
            };

            setMessages((prev) => {
              const final = prev.map((m) =>
                m.id === assistantMsgId ? finalMsg : m
              );
              setConversations((convs) =>
                convs.map((c) =>
                  c.id === currentId
                    ? { ...c, messages: final, conversationId: result.data.conversationId }
                    : c
                )
              );
              return final;
            });
          } else {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantMsgId
                  ? { ...m, content: result.error, status: 'error' }
                  : m
              )
            );
            setError(result.error);
          }
        }
      }
    },
    [messages, activeConversationId, conversations]
  );

  return {
    conversations,
    activeConversationId,
    messages,
    isLoading,
    error,
    sidebarOpen,
    toggleSidebar,
    sendMessage: handleSendMessage,
    newChat: handleNewChat,
    selectChat: handleSelectChat,
    editChat: handleEditChat,
    deleteChat: handleDeleteChat,
    clearChat: handleClearChat,
    retryMessage: handleRetryMessage,
  };
}
