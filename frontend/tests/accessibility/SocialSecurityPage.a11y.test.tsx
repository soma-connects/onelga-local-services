import React from 'react';
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import SocialSecurityPage from '../src/pages/services/SocialSecurityPage';

expect.extend(toHaveNoViolations);

describe('SocialSecurityPage accessibility', () => {
  it('should have no basic accessibility violations', async () => {
    const { container } = render(<SocialSecurityPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have tabs with aria-label', () => {
    render(<SocialSecurityPage />);
    const tabs = screen.getByLabelText(/social security tabs/i);
    expect(tabs).toBeInTheDocument();
  });
});
