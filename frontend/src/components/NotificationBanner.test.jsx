import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import NotificationBanner from './NotificationBanner';

describe('NotificationBanner', () => {
  it('renders nothing when no message is provided', () => {
    const { container } = render(<NotificationBanner message="" />);
    expect(container.firstChild).toBeNull();
  });

  it('renders the message text', () => {
    render(<NotificationBanner message="Saved!" />);
    expect(screen.getByText('Saved!')).not.toBeNull();
  });

  it('defaults to the info variant styling', () => {
    render(<NotificationBanner message="Heads up" />);
    expect(screen.getByRole('alert').className).toContain('bg-blue-50');
  });

  it('applies success variant styling', () => {
    render(<NotificationBanner message="Nice job" variant="success" />);
    expect(screen.getByRole('alert').className).toContain('bg-green-50');
  });

  it('shows a dismiss button by default and hides the banner when clicked', () => {
    const onDismiss = vi.fn();
    render(<NotificationBanner message="Bye" onDismiss={onDismiss} />);

    fireEvent.click(screen.getByRole('button', { name: /dismiss notification/i }));

    expect(onDismiss).toHaveBeenCalled();
    expect(screen.queryByText('Bye')).toBeNull();
  });

  it('hides the dismiss button when dismissible is false', () => {
    render(<NotificationBanner message="No close" dismissible={false} />);
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('auto-dismisses after the given delay', () => {
    vi.useFakeTimers();
    const onDismiss = vi.fn();
    render(<NotificationBanner message="Temporary" autoDismiss={1000} onDismiss={onDismiss} />);

    expect(screen.getByText('Temporary')).not.toBeNull();

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(onDismiss).toHaveBeenCalled();
    vi.useRealTimers();
  });
});
