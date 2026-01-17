# VisualEHR — Implementation Plan

## Overview

This document outlines the phased implementation of VisualEHR MVP. The goal is to deliver a working, local demo with a compressed-time clinical timeline in ~10 days of focused development.

## Phase 0: Project Setup (Day 1)

**Deliverable:** Working Vite + React + TS environment with Tailwind CSS and static data loading.

**Tasks:**
1. Initialize Vite React TS project.
2. Install Tailwind CSS and configure.
3. Create `/src/data/patient.demo.json` (static patient data).
4. Create basic App.tsx scaffolding.
5. Verify hot-reload and build.

**Definition of Done:**
- `npm run dev` launches dev server on `http://localhost:5173`.
- Patient data loads without errors.
- Tailwind CSS is available and working.

## Phase 1: Segment Generation (Day 2)

**Deliverable:** Segment array (encounters + gaps) with magnitude labels computed from patient data.

**Tasks:**
1. Create `src/utils/types.ts`: Define `Segment`, `Encounter`, `PatientData` types.
2. Create `src/utils/segmentArray.ts`: Implement segment generation logic.
   - Extract encounter dates from patient data.
   - Sort chronologically.
   - Compute gaps between encounters.
   - Assign magnitude labels (<1, N Months, N Months) based on duration.
3. Create `src/utils/helpers.ts`: Date math utilities (daysIn, monthsIn, formatDate, etc.).
4. Test in App.tsx by logging segment array.

**Definition of Done:**
- Segment array correctly computed from patient data.
- Gap magnitudes assigned correctly.
- All encounters and gaps appear in order.

## Phase 2: Scaffolding UI (Days 3–5)

**Deliverable:** Basic timeline UI with 4 domain tracks, subtypes, and cell structure (no data rendering yet).

**Tasks:**
1. **App.tsx:** Load patient data; instantiate Timeline component.
2. **Timeline.tsx:** Main layout (sticky patient rail, timeline viewport, track stack).
3. **TrackStack.tsx:** Render 4 domain tracks in order (Diagnoses, Medications, Labs, Vitals).
4. **Track.tsx:** Render one domain; iterate over subtypes.
5. **SubtypeRow.tsx:** Render one subtype; iterate over segments and render cells.
6. **Cell.tsx:** Render one cell (empty for now; just border).
7. **styles/index.css:** Tailwind setup + custom CSS for grid layout.

**Styling Approach:**
- Use CSS Grid for columns (segments × subtypes).
- Fixed column width for segments (e.g., 120px).
- Sticky left rail (patient info) and right (track labels).
- Horizontal scrolling in viewport; vertical scrolling for track stack.

**Definition of Done:**
- UI renders without errors.
- Layout looks correct (sticky rails, columns aligned, no horizontal scroll yet).
- No data rendered in cells (cells are empty or placeholder).

## Phase 3: Data Rendering (Days 6–7)

**Deliverable:** Cells display actual data (diagnoses, meds, labs, vitals) with continuous domain logic.

**Tasks:**
1. **Cell.tsx:** Implement cell data logic.
   - Receive segment, subtype, patient data.
   - For encounter segments: show data recorded in that encounter.
   - For gap segments: show continuous domains only (fill forward).
   - Format and render values.
2. **Continuous Domain Logic:** For diagnoses and medications, fetch active state across all segments up to current encounter. Show "active" state in gaps and subsequent encounters until marked resolved/discontinued.
3. **Point-in-Time Logic:** For labs and vitals, only render data in the encounter where recorded.
4. **Value Formatting:** Format units, abbreviations (HR: "92 bpm", A1c: "9.2%", etc.).

**Definition of Done:**
- Cells display actual values.
- Continuous domains visible across gaps and encounters.
- Point-in-time domains appear only in their encounter.
- Values are readable and formatted correctly.

## Phase 4: Interaction (Days 8–9)

**Deliverable:** Press-and-hold (Peek Card) and Context Highlight interactions.

**Tasks:**
1. **Cell.tsx:** Implement press-and-hold timer.
   - Start timer on `mousedown` / `touchstart`.
   - If timer completes (500ms) before release, set `isPressHeld`.
   - Cancel timer on `mouseup` / `touchend`.
2. **PeekCard.tsx:** Modal overlay.
   - Receive cell metadata (segment, subtype, values, dates).
   - Display full details (date, value, units, status, metadata).
   - Position near cell (avoid viewport overflow).
   - Dismiss on any external click or after user releases.
3. **Context Highlight (CSS + React State):**
   - On `mouseenter` or `onMouseDown` (start of hold), extract `segmentId`.
   - Set global state `contextHighlightSegmentId`.
   - CSS applies subtle background to all cells with matching `segmentId`.
   - Dismiss on `mouseleave` or `mouseup`.

**Definition of Done:**
- Press-and-hold for 500ms shows Peek Card.
- Peek Card displays full cell details.
- Peek Card dismisses on release or external click.
- Context Highlight (column wash) visible during hover or press-and-hold.

## Phase 5: Horizontal Pan (Day 10)

**Deliverable:** Smooth horizontal pan (drag to scroll timeline left/right).

**Tasks:**
1. **TrackStack.tsx:** Implement drag-to-pan logic.
   - Track `mousedown` position and segment at position 0.
   - On `mousemove`, compute delta and update `scrollX`.
   - Use CSS `transform: translateX()` for smooth pan.
2. **Detect pan vs. press-and-hold:** If user starts pan but doesn't move far, still allow press-and-hold to trigger.
3. **Pan bounds:** Ensure pan doesn't overflow viewport (clamp `scrollX`).

**Definition of Done:**
- Drag in timeline pans horizontally.
- Pan is smooth (60 fps, GPU-accelerated).
- Pan respects bounds (no over-scrolling).
- Drag + hold (pan + press-and-hold) can coexist (short drags may still show Peek Card).

## Phase 6: Polish & Testing (Optional, Day 11)

**Deliverable:** Refined visual design, responsive layout, edge-case handling.

**Tasks:**
1. Visual refinement: Colors, typography, spacing.
2. Responsive design: Mobile-friendly layout (optional for MVP).
3. Edge-case testing: Empty tracks, single encounter, large gaps, etc.
4. Performance check: Render time, pan frame rate.

---

## Checkpoint Checklist

- [ ] **Phase 0:** `npm run dev` works; patient data loads.
- [ ] **Phase 1:** Segment array computed and logged correctly.
- [ ] **Phase 2:** UI renders with correct layout; no data displayed yet.
- [ ] **Phase 3:** Data displays in cells; continuous domains persist across gaps.
- [ ] **Phase 4:** Press-and-hold shows Peek Card; Context Highlight works.
- [ ] **Phase 5:** Horizontal pan smooth and responsive.
- [ ] **Phase 6 (optional):** Visual design refined; responsive tested.

## Not in Scope (MVP)

- Zoom.
- Hover tooltips (press-and-hold only).
- Multi-patient view.
- Editing / persistence.
- Real-time updates.
- Export / print.
- Touch long-press (code prepared but not tested on devices).
- Vertical pan (only vertical scroll).

## Tech Stack

- **Framework:** React 18 + TypeScript (strict mode).
- **Build:** Vite.
- **Styling:** Tailwind CSS + custom CSS.
- **State:** React hooks (useState, useContext).
- **No external timeline/charting libraries.**

## Success Criteria

When complete, a clinician should be able to:

1. **See the timeline at a glance:** All encounters and gaps compressed on screen.
2. **Identify patterns:** Trends across domains visible without scrolling calendar time.
3. **Navigate:** Pan left/right to move through timeline; scroll vertically through tracks.
4. **Inspect:** Press-and-hold on any cell to see full details (Peek Card).
5. **Understand alignment:** Context Highlight shows which data points are same-day.

---

**Estimated Duration:** 10 days (1–2 days per phase with concurrent work).

**Key Risks:**
- Complex continuous domain logic (handle edge cases: changes, resolution dates).
- Smooth pan performance (use CSS transforms).
- Press-and-hold vs. pan detection (careful timer + threshold management).

**Mitigation:**
- Test each phase before moving to next.
- Use functional components + hooks for simplicity.
- Keep component tree shallow; avoid deeply nested renders.
