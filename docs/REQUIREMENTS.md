# VisualEHR — Requirements

## Overview

VisualEHR MVP is a compressed-time clinical timeline demo. It ingests patient data as static JSON and renders a single-patient view with encounter-driven temporal structure, multiple clinical domains, and press-and-hold interaction.

**Target:** Clinicians need to recognize patterns across clinical history without calendar noise and without accidental/transient interactions.

## Functional Requirements

### F1. Timeline Spine Construction

- **Load patient data** from `patient.demo.json` (single patient, static).
- **Extract encounters** (visit dates) from the data.
- **Generate segment array:**
  - Encounter Segment: one segment per encounter date, fixed width.
  - Gap Segment: one segment per chronological gap between encounters.
- **Compute gap magnitude** (Minimal, Moderate, Extended) based on duration:
  - Minimal: < 1 month → label "<1"
  - Moderate: 1–3 months → label "N Months"
  - Extended: ≥ 4 months → label "N Months"
- **Display magnitude label** visually in each gap cell at a glance.
- **Preserve encounter date** for press-and-hold detail inspection.

### F2. Domain Tracks & Subtypes

- **Render 4 domain tracks** in fixed order:
  1. Diagnoses (continuous)
  2. Medications (continuous)
  3. Labs (point-in-time)
  4. Vitals (point-in-time)
- **Each domain has subtypes:**
  - Diagnoses: individual diagnosis items
  - Medications: individual prescriptions
  - Labs: individual test results (A1c, glucose, LDL, etc.)
  - Vitals: individual vital types (HR, BP, SpO₂, Temp)
- **Subtypes render as stacked mini-rows** within their domain row.
- **Values display at intersection** of subtype row and encounter/gap segment column.

### F3. Continuous vs. Point-in-Time Behavior

**Point-in-Time Domains (Labs, Vitals):**
- Appear only in the encounter segment where recorded.
- Do NOT persist across gaps.
- Do NOT appear in subsequent encounters unless re-recorded.

**Continuous Domains (Diagnoses, Medications):**
- Begin at the encounter where first introduced.
- Remain visually present across subsequent encounters AND gaps.
- End only when explicitly marked resolved/discontinued at a later encounter.
- Changes (e.g., medication dose) must be visible without interaction (interaction deepens detail only).

### F4. Press-and-Hold Interaction

- **Trigger:** Click-hold (desktop) or long-press (touch).
- **Behavior:**
  - Display a **Peek Card** modal with full details (date, values, metadata).
  - Peek Card remains visible while pointer/touch is held.
  - Peek Card dismisses on release.
- **Applies to:** Any cell (encounter, gap, subtype value).
- **Details include:**
  - For encounter: date, visit type, location, any metadata.
  - For gap: exact start/end dates, duration in days.
  - For data point: full value, units, timestamp, status.

### F5. Context Highlight (Cross-Domain Encounter Alignment)

- **Trigger:**
  - Desktop: pointer hover over any cell in an encounter/gap column.
  - Touch + Desktop: press-and-hold (overlaps with Peek Card trigger).
- **Effect:**
  - Subtle column wash or faint vertical guide across the encounter/gap column.
  - Minimal cell outline to reinforce same-encounter alignment.
  - No layout shift, no obscuring content.
- **Scope:** All rows (all domains) in that column are lightly emphasized.
- **Purpose:** Clarify cross-domain correlations (which vitals/labs align with which diagnoses/meds on the same day).

### F6. Layout & Navigation

- **Sticky patient rail** (left): Patient name, MRN, DOB; does not pan.
- **Sticky track labels** (right): Domain names; does not pan.
- **Timeline viewport** (center): Pans horizontally; shows segment columns with data cells.
- **Track stack:** Scrolls vertically within viewport.

### F7. Interactions Supported in MVP

- **Horizontal pan:** Drag timeline left/right.
- **Vertical scroll:** Scroll track stack up/down (standard scroll or touch scroll).
- **Press-and-hold:** Inspect detail, trigger Peek Card + Context Highlight.
- **No zoom in MVP:** All segments fixed width, no magnification.
- **No hover tooltips:** All detail via press-and-hold only.

## Non-Functional Requirements

### NF1. Performance

- Load and render timeline in < 2 seconds (single patient, static JSON).
- Smooth horizontal pan (60 fps target).
- Smooth vertical scroll (60 fps target).

### NF2. Code Quality

- TypeScript: strict mode, no `any`.
- React: functional components, hooks.
- CSS: Tailwind or plain CSS; no external UI library.
- No external charting or timeline library; build custom.

### NF3. Compatibility

- Desktop: Chrome, Safari, Edge (mouse + keyboard).
- Touch (future): iOS Safari, Android Chrome (touch events).

## Out of Scope (MVP)

- Multi-patient views.
- Editing or persisting changes.
- Authentication / authorization.
- Zoom.
- Hover tooltips.
- Export / print.
- Settings / preferences.
- Real-time or backend integration.
