# app-agent-portal Skill Guide

## Scope

`app-agent-portal` owns the patient-facing web/mobile experience for DAO CARE:

- Online appointment booking.
- Patient profile and MRN information.
- Visit queue ticket and appointment status.
- Medical results, prescriptions, and imaging/result notes.
- Payment summary and patient guidance after checkout.

## Tech Stack

- Use ReactJS with Vite for the patient portal.
- Use component-based React screens and keep mock/demo data in a dedicated module until patient APIs are available.
- Use plain CSS or CSS modules for the portal shell unless a design system is explicitly introduced later.
- Use `lucide-react` for familiar UI icons in buttons, tabs, status cards, and navigation.

## UX Principles

- Build the usable patient experience as the first screen, not a marketing landing page.
- Use simple Vietnamese copy, short labels, and clear status text that a non-clinical patient can understand.
- Keep sensitive medical data visually calm: avoid loud colors for normal states, reserve red for warnings or overdue items.
- Patient tasks must be reachable in 1-2 taps on mobile: book appointment, view queue ticket, view results, pay, call clinic.
- Use a warm healthcare tone, but keep the interface operational and scannable.

## Responsive Requirements

- Mobile-first is mandatory. Design and test at 360px, 390px, 430px, 768px, 1024px, and desktop widths.
- No horizontal scrolling on mobile or tablet.
- Touch targets must be at least 44px high on mobile.
- Use a bottom navigation pattern on mobile. On tablet and desktop, the same navigation can become a rail/sidebar or wider tab bar.
- Forms must collapse to one column on mobile, two columns on tablet where space allows, and never squeeze labels into unreadable widths.
- Cards and panels must keep text inside their bounds. Long patient names, service names, addresses, and result notes must wrap or truncate intentionally.
- Appointment slots, queue cards, payment QR blocks, and result cards need stable dimensions so state changes do not shift the layout.
- Tablet layouts should be treated as a first-class experience, not just stretched mobile. Prefer 2-column dashboard grids between 768px and 1199px.
- Verify responsive states before handoff. At minimum, inspect mobile and tablet viewports for overlap, clipped text, broken fixed navigation, and unreachable actions.

## Visual Design

- Use DAO CARE green as the primary color with white and neutral surfaces; add supporting blue/amber only for information and attention states.
- Avoid one-note green screens. Use neutral backgrounds and restrained accent bands.
- Use real UI content and meaningful visual assets such as QR tickets, result cards, care timelines, branch maps, or patient identity cards.
- Do not use decorative blobs/orbs or marketing-style hero sections for the patient portal.

## Implementation Rules

- Keep the patient portal independent from the staff/admin portal unless an API contract is explicitly shared.
- Define mock data in one place until backend patient APIs exist.
- Prefer accessible native controls for forms, dates, segmented filters, tabs, and dialogs.
- Store only harmless demo state in localStorage while the backend patient auth flow is not implemented.
- Write compact, readable CSS with clear responsive breakpoints.
