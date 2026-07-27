import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import LoadingSpinner from './LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renders a spinner with medium size classes by default', () => {
    const { container } = render(<LoadingSpinner />);
    const spinner = container.querySelector('div.animate-spin');
    expect(spinner).not.toBeNull();
    expect(spinner.className).toContain('h-10');
    expect(spinner.className).toContain('w-10');
  });

  it('applies small size classes when size is "sm"', () => {
    const { container } = render(<LoadingSpinner size="sm" />);
    const spinner = container.querySelector('div.animate-spin');
    expect(spinner.className).toContain('h-5');
    expect(spinner.className).toContain('w-5');
  });

  it('applies large size classes when size is "lg"', () => {
    const { container } = render(<LoadingSpinner size="lg" />);
    const spinner = container.querySelector('div.animate-spin');
    expect(spinner.className).toContain('h-16');
    expect(spinner.className).toContain('w-16');
  });

  it('falls back to medium size classes for an unknown size', () => {
    const { container } = render(<LoadingSpinner size="xl" />);
    const spinner = container.querySelector('div.animate-spin');
    expect(spinner.className).toContain('h-10');
    expect(spinner.className).toContain('w-10');
  });

  it('does not render a message paragraph by default', () => {
    const { container } = render(<LoadingSpinner />);
    expect(container.querySelector('p')).toBeNull();
  });

  it('renders the message text when provided', () => {
    render(<LoadingSpinner message="Loading transactions..." />);
    expect(screen.getByText('Loading transactions...')).not.toBeNull();
  });
});
