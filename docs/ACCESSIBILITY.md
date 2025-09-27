# Accessibility Guide

This document describes the accessibility standards, patterns, and testing approaches used in the Onelga Local Services project.

## Standards
- Follows [WCAG 2.1 AA](https://www.w3.org/WAI/standards-guidelines/wcag/) guidelines
- Uses ARIA roles and attributes for screen reader support
- Ensures keyboard navigation and visible focus indicators
- Provides sufficient color contrast
- Accessible form labels and error messages

## Patterns
- Use semantic HTML and Material-UI components
- All interactive elements must have visible text or `aria-label`
- Use `role`, `aria-live`, and `aria-controls` where appropriate
- Test with screen readers and keyboard only

## Testing
- Automated tests with `@testing-library/react` and `jest-axe`
- Manual audits with browser accessibility tools
- CI checks for accessibility regressions

## Developer Checklist
- [ ] All forms have labels and error messages
- [ ] All buttons/links are keyboard accessible
- [ ] No color is the only means of conveying information
- [ ] All dynamic content uses ARIA live regions if needed
- [ ] All images/icons have alt text or aria-label
