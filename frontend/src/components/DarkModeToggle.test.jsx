import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DarkModeToggle from './DarkModeToggle';

function mockMatchMedia(matches) {
  window.matchMedia = vi.fn().mockReturnValue({ matches });
}

beforeEach(() => {
  window.localStorage.clear();
  document.documentElement.classList.remove('dark');
  mockMatchMedia(false);
});

describe('DarkModeToggle', () => {
  it('defaults to light mode when no preference is stored', () => {
    render(<DarkModeToggle />);
    expect(screen.getByRole('button', { name: /switch to dark mode/i })).not.toBeNull();
  });

  it('honors the stored dark mode preference', () => {
    window.localStorage.setItem('pft-dark-mode', 'true');
    render(<DarkModeToggle />);
    expect(screen.getByRole('button', { name: /switch to light mode/i })).not.toBeNull();
  });

  it('falls back to the OS color scheme preference when nothing is stored', () => {
    mockMatchMedia(true);
    render(<DarkModeToggle />);
    expect(screen.getByRole('button', { name: /switch to light mode/i })).not.toBeNull();
  });

  it('toggles the dark class on <html> and persists the choice when clicked', () => {
    render(<DarkModeToggle />);
    const button = screen.getByRole('button');

    fireEvent.click(button);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(window.localStorage.getItem('pft-dark-mode')).toBe('true');

    fireEvent.click(button);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(window.localStorage.getItem('pft-dark-mode')).toBe('false');
  });
});
