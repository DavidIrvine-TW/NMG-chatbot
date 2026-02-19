import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Sidebar from '../Sidebar';
import type { Conversation } from '@/types/chat';

// Mock CSS imports
jest.mock('../Sidebar.css', () => ({}));
jest.mock('../../ThemeToggle/ThemeToggle.css', () => ({}));

const conversations: Conversation[] = [
  { id: 'c1', title: 'First Chat', messages: [] },
  { id: 'c2', title: 'Second Chat', messages: [] },
];

const defaultProps = {
  conversations,
  activeId: 'c1',
  onNewChat: jest.fn(),
  onSelectChat: jest.fn(),
  onEditChat: jest.fn(),
  onDeleteChat: jest.fn(),
  isOpen: true,
  onToggle: jest.fn(),
};

describe('Sidebar', () => {
  it('renders conversation titles', () => {
    render(<Sidebar {...defaultProps} />);
    expect(screen.getByText('First Chat')).toBeInTheDocument();
    expect(screen.getByText('Second Chat')).toBeInTheDocument();
  });

  it('highlights active conversation', () => {
    const { container } = render(<Sidebar {...defaultProps} />);
    const items = container.querySelectorAll('.conversation-item');
    expect(items[0]).toHaveClass('active');
    expect(items[1]).not.toHaveClass('active');
  });

  it('calls onNewChat when New Chat button is clicked', async () => {
    const user = userEvent.setup();
    const onNewChat = jest.fn();
    // Use innerWidth > 768 to avoid closeMobile triggering onToggle
    Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true });

    render(<Sidebar {...defaultProps} onNewChat={onNewChat} />);
    await user.click(screen.getByLabelText('Start new chat'));

    expect(onNewChat).toHaveBeenCalled();
  });

  it('calls onSelectChat when a conversation is clicked', async () => {
    const user = userEvent.setup();
    const onSelectChat = jest.fn();
    Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true });

    render(<Sidebar {...defaultProps} onSelectChat={onSelectChat} />);
    await user.click(screen.getByText('Second Chat'));

    expect(onSelectChat).toHaveBeenCalledWith('c2');
  });

  it('enters edit mode and saves on Enter', async () => {
    const user = userEvent.setup();
    const onEditChat = jest.fn();
    render(<Sidebar {...defaultProps} onEditChat={onEditChat} />);

    // Click edit button for first conversation
    const editBtns = screen.getAllByLabelText('Edit conversation');
    await user.click(editBtns[0]);

    const input = screen.getByLabelText('Edit conversation title');
    expect(input).toHaveValue('First Chat');

    await user.clear(input);
    await user.type(input, 'Renamed Chat{Enter}');

    expect(onEditChat).toHaveBeenCalledWith('c1', 'Renamed Chat');
  });

  it('cancels edit on Escape', async () => {
    const user = userEvent.setup();
    const onEditChat = jest.fn();
    render(<Sidebar {...defaultProps} onEditChat={onEditChat} />);

    const editBtns = screen.getAllByLabelText('Edit conversation');
    await user.click(editBtns[0]);

    const input = screen.getByLabelText('Edit conversation title');
    await user.type(input, '{Escape}');

    expect(onEditChat).not.toHaveBeenCalled();
    // Should exit edit mode — input should no longer be present
    expect(screen.queryByLabelText('Edit conversation title')).not.toBeInTheDocument();
  });

  it('calls onDeleteChat when delete button is clicked', async () => {
    const user = userEvent.setup();
    const onDeleteChat = jest.fn();
    render(<Sidebar {...defaultProps} onDeleteChat={onDeleteChat} />);

    const deleteBtns = screen.getAllByLabelText('Delete conversation');
    await user.click(deleteBtns[1]);

    expect(onDeleteChat).toHaveBeenCalledWith('c2');
  });

  it('renders New Chat button and brand', () => {
    render(<Sidebar {...defaultProps} />);
    expect(screen.getByText('New Chat')).toBeInTheDocument();
    expect(screen.getByText('AI Chat')).toBeInTheDocument();
    expect(screen.getByText('Conversations')).toBeInTheDocument();
  });
});
