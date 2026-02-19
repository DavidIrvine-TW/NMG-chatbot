import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ChatWindow from '../ChatWindow';
import type { Message } from '@/types/chat';

// Mock CSS imports
jest.mock('../ChatWindow.css', () => ({}));
jest.mock('../../ChatInput/ChatInput.css', () => ({}));
jest.mock('../../MessageBubble/MessageBubble.css', () => ({}));

// Mock react-markdown
jest.mock('react-markdown', () => {
  return function MockMarkdown({ children }: { children: string }) {
    return <div data-testid="markdown">{children}</div>;
  };
});
jest.mock('remark-gfm', () => () => {});

// Suppress scrollIntoView (not implemented in jsdom)
Element.prototype.scrollIntoView = jest.fn();

const defaultProps = {
  messages: [] as Message[],
  onSendMessage: jest.fn(),
  onClearChat: jest.fn(),
  onRetryMessage: jest.fn(),
  isLoading: false,
};

describe('ChatWindow', () => {
  it('shows starter questions when no messages', () => {
    render(<ChatWindow {...defaultProps} />);

    expect(screen.getByText('AI Chat')).toBeInTheDocument();
    expect(screen.getByText('Ask me anything to get started')).toBeInTheDocument();
    expect(screen.getByText('What can you help me with?')).toBeInTheDocument();
    expect(screen.getByText('Tell me something interesting')).toBeInTheDocument();
    expect(screen.getByText('How does this chat work?')).toBeInTheDocument();
    expect(screen.getByText('What are your capabilities?')).toBeInTheDocument();
  });

  it('sends message when starter question is clicked', async () => {
    const user = userEvent.setup();
    const onSendMessage = jest.fn();
    render(<ChatWindow {...defaultProps} onSendMessage={onSendMessage} />);

    await user.click(screen.getByText('What can you help me with?'));
    expect(onSendMessage).toHaveBeenCalledWith('What can you help me with?');
  });

  it('renders messages when present', () => {
    const messages: Message[] = [
      { id: '1', role: 'user', content: 'Hi', timestamp: '2024-01-01T00:00:00Z' },
      { id: '2', role: 'assistant', content: 'Hello!', timestamp: '2024-01-01T00:00:01Z' },
    ];
    render(<ChatWindow {...defaultProps} messages={messages} />);

    expect(screen.getByText('Hi')).toBeInTheDocument();
    expect(screen.getByTestId('markdown')).toHaveTextContent('Hello!');
    // Starter questions should not be visible
    expect(screen.queryByText('Ask me anything to get started')).not.toBeInTheDocument();
  });

  it('shows typing indicator when loading and last message is not sending', () => {
    const messages: Message[] = [
      { id: '1', role: 'user', content: 'Hi', timestamp: '2024-01-01T00:00:00Z', status: 'sent' },
    ];
    render(<ChatWindow {...defaultProps} messages={messages} isLoading />);

    expect(screen.getByLabelText('Assistant is typing')).toBeInTheDocument();
  });

  it('does not show typing indicator when last message has sending status', () => {
    const messages: Message[] = [
      { id: '1', role: 'user', content: 'Hi', timestamp: '2024-01-01T00:00:00Z', status: 'sending' },
    ];
    render(<ChatWindow {...defaultProps} messages={messages} isLoading />);

    expect(screen.queryByLabelText('Assistant is typing')).not.toBeInTheDocument();
  });

  it('shows clear button only when messages exist', () => {
    const { rerender } = render(<ChatWindow {...defaultProps} />);
    expect(screen.queryByLabelText('Clear chat')).not.toBeInTheDocument();

    const messages: Message[] = [
      { id: '1', role: 'user', content: 'Hi', timestamp: '2024-01-01T00:00:00Z' },
    ];
    rerender(<ChatWindow {...defaultProps} messages={messages} />);
    expect(screen.getByLabelText('Clear chat')).toBeInTheDocument();
  });

  it('calls onClearChat when clear button is clicked', async () => {
    const user = userEvent.setup();
    const onClearChat = jest.fn();
    const messages: Message[] = [
      { id: '1', role: 'user', content: 'Hi', timestamp: '2024-01-01T00:00:00Z' },
    ];
    render(<ChatWindow {...defaultProps} messages={messages} onClearChat={onClearChat} />);

    await user.click(screen.getByLabelText('Clear chat'));
    expect(onClearChat).toHaveBeenCalled();
  });

  it('disables clear button when loading', () => {
    const messages: Message[] = [
      { id: '1', role: 'user', content: 'Hi', timestamp: '2024-01-01T00:00:00Z', status: 'sent' },
    ];
    render(<ChatWindow {...defaultProps} messages={messages} isLoading />);

    expect(screen.getByLabelText('Clear chat')).toBeDisabled();
  });
});
