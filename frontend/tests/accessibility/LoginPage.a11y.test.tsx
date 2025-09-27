import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import LoginPage from '../src/pages/auth/LoginPage';

expect.extend(toHaveNoViolations);

describe('LoginPage accessibility', () => {
  it('should have no basic accessibility violations', async () => {
    const { container } = render(<LoginPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have a password visibility toggle with aria-label', () => {
    render(<LoginPage />);
    const toggleBtn = screen.getByLabelText(/toggle password visibility/i);
    expect(toggleBtn).toBeInTheDocument();
  });
});
