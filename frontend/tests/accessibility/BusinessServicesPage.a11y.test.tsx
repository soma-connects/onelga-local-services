import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import BusinessServicesPage from '../src/pages/services/BusinessServicesPage';

expect.extend(toHaveNoViolations);

describe('BusinessServicesPage accessibility', () => {
  it('should have no basic accessibility violations', async () => {
    const { container } = render(<BusinessServicesPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have an alert with role status and aria-live polite', () => {
    render(<BusinessServicesPage />);
    const alert = screen.getByRole('status');
    expect(alert).toHaveAttribute('aria-live', 'polite');
  });
});
