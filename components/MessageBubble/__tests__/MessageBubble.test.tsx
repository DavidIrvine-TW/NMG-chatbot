import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MessageBubble from '../MessageBubble';
import type { Message } from '@/types/chat';

// Mock CSS import
jest.mock('../MessageBubble.css', () => ({}));

// Mock react-markdown to render children as plain text
jest.mock('react-markdown', () => {
  return function MockMarkdown({ children }: { children: string }) {
    return <div data-testid="markdown">{children}</div>;
  };
});
jest.mock('remark-gfm', () => () => {});

const baseMessage: Message = {
  id: 'msg_1',
  role: 'user',
  content: 'Hello there',
  timestamp: '2024-06-15T10:30:00Z',
};

describe('MessageBubble', () => {
  it('renders user message as plain text (no markdown)', () => {
    render(<MessageBubble message={baseMessage} />);
    expect(screen.getByText('Hello there')).toBeInTheDocument();
    expect(screen.queryByTestId('markdown')).not.toBeInTheDocument();
  });

  it('renders assistant message with markdown', () => {
    const msg: Message = { ...baseMessage, role: 'assistant', content: '**Bold text**' };
    render(<MessageBubble message={msg} />);
    expect(screen.getByTestId('markdown')).toHaveTextContent('**Bold text**');
  });

  it('shows bot avatar for assistant messages only', () => {
    const { container: userContainer } = render(<MessageBubble message={baseMessage} />);
    expect(userContainer.querySelector('.bot-avatar')).not.toBeInTheDocument();

    const assistantMsg: Message = { ...baseMessage, role: 'assistant' };
    const { container: botContainer } = render(<MessageBubble message={assistantMsg} />);
    expect(botContainer.querySelector('.bot-avatar')).toBeInTheDocument();
  });

  it('displays formatted timestamp', () => {
    render(<MessageBubble message={baseMessage} />);
    // toLocaleTimeString output varies by environment, just check something renders in message-time
    const timeEl = document.querySelector('.message-time');
    expect(timeEl).toBeInTheDocument();
    expect(timeEl!.textContent).not.toBe('');
  });

  it('applies error class and shows retry button on error status', async () => {
    const user = userEvent.setup();
    const onRetry = jest.fn();
    const errorMsg: Message = { ...baseMessage, status: 'error' };

    const { container } = render(<MessageBubble message={errorMsg} onRetry={onRetry} />);

    expect(container.querySelector('.message-bubble.error')).toBeInTheDocument();

    const retryBtn = screen.getByLabelText('Retry message');
    expect(retryBtn).toBeInTheDocument();

    await user.click(retryBtn);
    expect(onRetry).toHaveBeenCalledWith('msg_1');
  });

  it('does not show retry button when no onRetry callback', () => {
    const errorMsg: Message = { ...baseMessage, status: 'error' };
    render(<MessageBubble message={errorMsg} />);
    expect(screen.queryByLabelText('Retry message')).not.toBeInTheDocument();
  });

  it('does not show retry button when status is not error', () => {
    render(<MessageBubble message={baseMessage} onRetry={jest.fn()} />);
    expect(screen.queryByLabelText('Retry message')).not.toBeInTheDocument();
  });
});
