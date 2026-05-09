# Accessibility Compliance Review Policy

This policy defines when an accessibility review is required for a launch and
what questions the accessibility team needs answered. The compliance review
workflow reads this file at runtime. Customize it to match your organization's
standards.

## Rubric — When Is an Accessibility Review Needed?

An accessibility review is **needed** if ANY of the following are true:

- Launch introduces new user-facing UI components or pages
- Launch modifies existing UI interaction patterns
- Launch changes navigation structure or information architecture
- Launch introduces new media content (images, video, audio)
- Launch modifies form inputs, controls, or interactive elements
- Launch changes color schemes, typography, or visual hierarchy
- Launch introduces new notifications, alerts, or status messages
- Launch targets mobile or introduces responsive design changes
- Launch body or sub-issues mention: UI, frontend, user interface,
  mobile app, responsive, or similar terms

An accessibility review is **not needed** if the launch:

- Is purely backend/API with no UI impact
- Is infrastructure or DevOps only
- Is data migration with no user-facing changes

## Review Questions

When an accessibility review is needed, the following questions must be
answered by the DRI and reviewed by the accessibility team. These form
the starter review content that the workflow generates.

### Scope & Standards

1. What UI components, pages, or flows are new or changed in this launch?
2. What is the target conformance level (e.g., WCAG 2.1 AA, WCAG 2.2 AA)?
3. What user groups should be considered (screen reader users, keyboard-only users, low-vision users, users with motor impairments)?

### Keyboard & Navigation

4. Can all new interactive elements be reached and operated via keyboard alone?
5. Is the tab order logical and does it follow the visual reading order?
6. Are there any keyboard traps (elements that capture focus and prevent navigation)?
7. Are skip links or landmark regions provided for long pages?

### Screen Reader Compatibility

8. Do all interactive elements have accessible names (via labels, ARIA, or visible text)?
9. Are ARIA roles, states, and properties used correctly for custom components?
10. Are dynamic content updates announced to screen readers (via live regions or focus management)?
11. Are decorative images marked as presentational (empty alt or role="presentation")?

### Visual Design

12. Does text meet minimum contrast ratios (4.5:1 for normal text, 3:1 for large text)?
13. Is information conveyed through means other than color alone?
14. Are focus indicators visible on all interactive elements?
15. Does the layout work at 200% browser zoom without loss of content or functionality?

### Forms & Inputs

16. Do all form inputs have visible, associated labels?
17. Are required fields clearly indicated (not by color alone)?
18. Are error messages specific, descriptive, and programmatically associated with their fields?
19. Is autocomplete used where appropriate for personal information fields?

### Media & Motion

20. Do images and non-text content have appropriate alternative text?
21. Do videos have captions and/or transcripts?
22. Does any animation respect the `prefers-reduced-motion` media query?
23. Are there any auto-playing media, carousels, or timed interactions? Can they be paused?

### Mobile & Responsive

24. Are touch targets at least 44×44 CSS pixels?
25. Does the interface work in both portrait and landscape orientations?
26. Are gestures (swipe, pinch, etc.) supplemented by single-pointer alternatives?

## Review Checklist

The accessibility reviewer should verify:

- [ ] Keyboard navigation — all interactive elements reachable
- [ ] Screen reader compatibility — proper ARIA labels and roles
- [ ] Color contrast — meets 4.5:1 (text) / 3:1 (large text) ratios
- [ ] Focus management — logical focus order, visible focus indicators
- [ ] Alternative text — all images and media have descriptions
- [ ] Form labels — all inputs have associated labels
- [ ] Error handling — errors clearly identified and described
- [ ] Motion / animation — respects prefers-reduced-motion

## Labels

- `needs:accessibility` — an accessibility review is required and pending
- `approved:accessibility` — the accessibility review has been completed and approved
