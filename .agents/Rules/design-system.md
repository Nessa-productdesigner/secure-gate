---
trigger: always_on
---

# design-system.md

# SecureGate Design System

This document defines the visual language, UI foundations,
interaction principles, accessibility standards, and component
behavior rules for SecureGate.

SecureGate is a security-focused authentication application.
Its interface should communicate:
- trust,
- clarity,
- stability,
- professionalism,
- and precision.

The design system must support:
- production scalability,
- accessibility,
- consistency,
- and clean engineering implementation.

---

# Design Philosophy

## 1. Clarity Over Decoration

The interface should:
- feel clean,
- predictable,
- and easy to scan.

Avoid:
- excessive gradients
- noisy visuals
- unnecessary animation
- visual clutter
- trend-heavy styling

SecureGate should feel:
- calm,
- structured,
- and trustworthy.

---

## 2. Functional Minimalism

Every UI element must serve a purpose.

Remove:
- decorative distractions
- ambiguous interactions
- unnecessary complexity

Prioritize:
- usability
- readability
- accessibility
- responsiveness

---

## 3. Security-Inspired Visual Tone

The product should visually communicate:
- reliability,
- confidence,
- and control.

Design references:
- enterprise dashboards
- modern developer tools
- security platforms
- banking interfaces
- infrastructure products

---

# Visual Identity

## Brand Personality

SecureGate should feel:

| Trait | Meaning |
|---|---|
| Professional | Serious and production-ready |
| Calm | No visual chaos |
| Technical | Engineered with discipline |
| Modern | Clean and contemporary |
| Trustworthy | Security-focused |

---

# Color System

## Primary Colors

Recommended:
```txt
Neutral base + controlled accent color
```

Suggested palette:
```txt
Background: #0F172A
Surface: #111827
Primary: #2563EB
Success: #16A34A
Warning: #D97706
Error: #DC2626
Border: #1F2937
Text Primary: #F9FAFB
Text Secondary: #9CA3AF
```

---

## Color Usage Rules

Primary color:
- actions
- focus states
- active UI

Success:
- verified state
- successful actions

Warning:
- pending verification
- rate limits

Error:
- validation failures
- auth failures

Avoid:
- overly saturated palettes
- rainbow UI
- random color usage

---

# Typography

## Font Characteristics

Typography should feel:
- highly readable
- modern
- professional

Recommended:
```txt
Inter
Geist
System UI stack
```

---

## Font Scale

| Element | Size |
|---|---|
| Page Title | 32px |
| Section Title | 24px |
| Card Title | 20px |
| Body Text | 16px |
| Small Text | 14px |
| Labels | 14px |

---

## Typography Rules

Use:
- strong hierarchy
- consistent spacing
- predictable scaling

Avoid:
- excessive font weights
- decorative fonts
- inconsistent sizes

---

# Spacing System

## Spacing Scale

Use a consistent spacing system.

Recommended scale:
```txt
4
8
12
16
20
24
32
40
48
64
```

---

## Layout Rhythm

UI should maintain:
- breathing room
- clean alignment
- consistent padding

Avoid:
- cramped forms
- inconsistent gaps
- oversized empty sections

---

# Layout Principles

## Container Width

Recommended auth layout:
```txt
max-w-md
```

Dashboard layouts:
```txt
max-w-6xl
```

---

## Screen Structure

Auth screens should generally contain:
1. Logo or product identity
2. Heading
3. Supporting text
4. Form
5. Secondary actions

---

## Alignment

Prefer:
- centered auth layouts
- left-aligned form content
- consistent vertical rhythm

---

# Surface Design

## Cards

Cards should:
- separate content clearly
- use subtle elevation
- maintain soft contrast

Recommended:
```txt
Rounded corners: lg or xl
Border-based separation
Minimal shadow
```

---

## Borders

Borders should:
- remain subtle
- support structure
- avoid heavy outlines

Recommended:
```txt
1px neutral borders
```

---

# Input System

## Input Design

Inputs must:
- feel stable
- remain highly readable
- provide clear interaction feedback

Required states:
- default
- hover
- focus
- disabled
- error

---

## Input Rules

Inputs must include:
- labels
- placeholder text
- accessible focus indicators
- visible validation feedback

Avoid:
- floating labels only
- low-contrast placeholders
- hidden error states

---

# Button System

## Button Hierarchy

### Primary Button
Used for:
- login
- signup
- reset password
- confirm actions

### Secondary Button
Used for:
- navigation
- less critical actions

### Ghost Button
Used for:
- subtle utility actions
- low emphasis actions

---

## Button Rules

Buttons must:
- have consistent height
- maintain readable text contrast
- show hover/focus states
- support disabled/loading states

Loading buttons should:
- prevent duplicate submissions
- visually communicate progress

---

# Feedback System

## Success States

Examples:
- Email verified
- Password reset successful
- Account created

Use:
- green accent
- confirmation icon
- concise messaging

---

## Error States

Examples:
- Invalid credentials
- Expired token
- Validation failures

Rules:
- errors should remain actionable
- avoid technical jargon
- avoid leaking implementation details

Correct:
```txt
Invalid credentials
```

Incorrect:
```txt
Password hash mismatch
```

---

## Warning States

Examples:
- Pending email verification
- Rate limit reached

Warnings should:
- remain visible
- avoid panic-inducing language

---

# Loading States

## Async Feedback

Every async action must:
- show progress state
- disable repeated submission
- preserve layout stability

---

## Spinners

Spinners should:
- remain subtle
- not dominate the UI
- communicate temporary activity

---

# Accessibility Standards

## Mandatory Accessibility

All UI must:
- support keyboard navigation
- support screen readers
- include visible focus states
- maintain proper contrast ratios

---

## Form Accessibility

Every input requires:
- `<label>`
- associated `id`
- error association
- keyboard accessibility

---

## Focus States

Focus states must:
- remain clearly visible
- use accessible contrast
- never be removed entirely

Avoid:
```css
outline: none;
```

without replacement focus styles.

---

# Motion & Animation

## Animation Philosophy

Motion should:
- feel subtle
- communicate state
- improve clarity

Avoid:
- excessive transitions
- distracting animations
- decorative movement

---

## Recommended Motion

Allowed:
- fade transitions
- subtle hover feedback
- loading animations
- smooth state changes

Duration recommendation:
```txt
150ms–250ms
```

---

# Dark Mode

SecureGate should support dark mode by default.

Dark mode should:
- preserve readability
- avoid pure black backgrounds
- maintain strong contrast

Recommended:
```txt
Slate / Zinc neutral palette
```

---

# Responsive Design

## Mobile First

Design mobile-first layouts.

Auth flows must:
- remain usable on small screens
- maintain spacing consistency
- avoid horizontal overflow

---

## Breakpoint Philosophy

Focus on:
- readability
- spacing adaptation
- interaction comfort

Not:
- excessive layout shifts

---

# Iconography

## Icon Rules

Icons should:
- support meaning
- remain simple
- align visually

Recommended:
```txt
Lucide Icons
```

Avoid:
- decorative icon overload
- inconsistent icon styles

---

# Component Consistency

All components should:
- share spacing patterns
- share typography logic
- share interaction behavior

The interface should feel unified.

---

# Security-Centered UX

Security-sensitive flows must:
- communicate clearly
- avoid confusion
- reassure users

Examples:
- password reset confirmation
- verification instructions
- session expiration states

Tone should remain:
- calm,
- professional,
- and trustworthy.

---

# Design Quality Checklist

Before finalizing UI verify:

- [ ] Accessibility standards are met
- [ ] Focus states are visible
- [ ] Error states are actionable
- [ ] Layout spacing is consistent
- [ ] Typography hierarchy is clear
- [ ] Loading states exist
- [ ] Mobile responsiveness works
- [ ] Components feel unified
- [ ] Contrast ratios are accessible
- [ ] Security flows feel trustworthy

---

# Final Design Principle

SecureGate should feel like:
- a real authentication platform,
- not a tutorial project.

The design system should communicate:
- confidence,
- engineering maturity,
- usability,
- and operational reliability.

Every interface should feel:
- intentional,
- secure,
- accessible,
- and production-ready.