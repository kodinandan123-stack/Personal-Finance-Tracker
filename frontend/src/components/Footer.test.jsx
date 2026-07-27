import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Footer from './Footer';

describe('Footer', () => {
  it('renders the copyright notice with the current year', () => {
    render(<Footer />);
    const year = new Date().getFullYear();
    expect(screen.getByText(new RegExp(`${year} Personal Finance Tracker`))).not.toBeNull();
  });

  it('renders the "Built with" tagline', () => {
    render(<Footer />);
    expect(screen.getByText('Built with React & Tailwind CSS')).not.toBeNull();
  });

  it('renders as a footer landmark element', () => {
    const { container } = render(<Footer />);
    expect(container.querySelector('footer')).not.toBeNull();
  });
});
