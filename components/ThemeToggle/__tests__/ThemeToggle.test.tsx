import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ThemeToggle from '../ThemeToggle';

// Mock CSS import
jest.mock('../ThemeToggle.css', () => ({}));

beforeEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute('data-theme');
});

describe('ThemeToggle', () => {
  it('renders with dark mode aria-label by default (light mode)', () => {
    render(<ThemeToggle />);
    expect(screen.getByLabelText('Switch to dark mode')).toBeInTheDocument();
  });

  it('toggles to dark mode on click', async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);

    await user.click(screen.getByLabelText('Switch to dark mode'));

    expect(screen.getByLabelText('Switch to light mode')).toBeInTheDocument();
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(localStorage.getItem('aichat_theme')).toBe('dark');
  });

  it('toggles back to light mode on second click', async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);

    const btn = screen.getByRole('button');
    await user.click(btn);
    await user.click(btn);

    expect(screen.getByLabelText('Switch to dark mode')).toBeInTheDocument();
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(localStorage.getItem('aichat_theme')).toBe('light');
  });

  it('restores dark mode from localStorage on mount', () => {
    localStorage.setItem('aichat_theme', 'dark');
    render(<ThemeToggle />);

    expect(screen.getByLabelText('Switch to light mode')).toBeInTheDocument();
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('stays in light mode when localStorage has no theme', () => {
    render(<ThemeToggle />);
    expect(screen.getByLabelText('Switch to dark mode')).toBeInTheDocument();
  });
});
