import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ChatInput from '../ChatInput';

// Mock CSS import
jest.mock('../ChatInput.css', () => ({}));

describe('ChatInput', () => {
  it('renders textarea and send button', () => {
    render(<ChatInput onSend={jest.fn()} />);
    expect(screen.getByLabelText('Message input')).toBeInTheDocument();
    expect(screen.getByLabelText('Send message')).toBeInTheDocument();
  });

  it('calls onSend with trimmed message on form submit', async () => {
    const user = userEvent.setup();
    const onSend = jest.fn();
    render(<ChatInput onSend={onSend} />);

    const textarea = screen.getByLabelText('Message input');
    await user.type(textarea, 'Hello world');
    await user.click(screen.getByLabelText('Send message'));

    expect(onSend).toHaveBeenCalledWith('Hello world');
  });

  it('sends message on Enter key', async () => {
    const user = userEvent.setup();
    const onSend = jest.fn();
    render(<ChatInput onSend={onSend} />);

    const textarea = screen.getByLabelText('Message input');
    await user.type(textarea, 'Hello{Enter}');

    expect(onSend).toHaveBeenCalledWith('Hello');
  });

  it('does not send on Shift+Enter (allows newline)', async () => {
    const user = userEvent.setup();
    const onSend = jest.fn();
    render(<ChatInput onSend={onSend} />);

    const textarea = screen.getByLabelText('Message input');
    await user.type(textarea, 'line1{Shift>}{Enter}{/Shift}line2');

    expect(onSend).not.toHaveBeenCalled();
  });

  it('does not send empty or whitespace-only messages', async () => {
    const user = userEvent.setup();
    const onSend = jest.fn();
    render(<ChatInput onSend={onSend} />);

    const textarea = screen.getByLabelText('Message input');
    await user.type(textarea, '   {Enter}');

    expect(onSend).not.toHaveBeenCalled();
  });

  it('disables textarea and button when disabled prop is true', () => {
    render(<ChatInput onSend={jest.fn()} disabled />);

    expect(screen.getByLabelText('Message input')).toBeDisabled();
    expect(screen.getByLabelText('Send message')).toBeDisabled();
  });

  it('send button is disabled when textarea is empty', () => {
    render(<ChatInput onSend={jest.fn()} />);
    expect(screen.getByLabelText('Send message')).toBeDisabled();
  });

  it('clears input after sending', async () => {
    const user = userEvent.setup();
    render(<ChatInput onSend={jest.fn()} />);

    const textarea = screen.getByLabelText('Message input');
    await user.type(textarea, 'Hello{Enter}');

    expect(textarea).toHaveValue('');
  });
});
