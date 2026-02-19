'use client';

import Sidebar from '@/components/Sidebar/Sidebar';
import ChatWindow from '@/components/ChatWindow/ChatWindow';
import { useChat } from '@/hooks/useChat';
import './page.css';

export default function Home() {
  const {
    conversations,
    activeConversationId,
    messages,
    isLoading,
    error,
    sidebarOpen,
    toggleSidebar,
    sendMessage,
    newChat,
    selectChat,
    editChat,
    deleteChat,
    clearChat,
    retryMessage,
  } = useChat();

  return (
    <div className="app">
      <Sidebar
        conversations={conversations}
        activeId={activeConversationId}
        onNewChat={newChat}
        onSelectChat={selectChat}
        onEditChat={editChat}
        onDeleteChat={deleteChat}
        isOpen={sidebarOpen}
        onToggle={toggleSidebar}
      />

      <main className="main-content">
        <ChatWindow
          messages={messages}
          onSendMessage={sendMessage}
          onClearChat={clearChat}
          onRetryMessage={retryMessage}
          isLoading={isLoading}
        />
      </main>

      {error && (
        <div className="error-toast" role="alert">
          <span className="error-icon" aria-hidden="true">!</span>
          {error}
        </div>
      )}
    </div>
  );
}
