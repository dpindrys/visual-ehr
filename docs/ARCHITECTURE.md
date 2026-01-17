# VisualEHR — Architecture

## System Overview

VisualEHR MVP is a single-page React application that loads static patient JSON and renders a compressed-time clinical timeline.

```
┌─────────────────────────────────────────────────────────────────┐
│                      VisualEHR App                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  Timeline Layout (sticky left rail + panning center)        │ │
│  │                                                              │ │
│  │  ┌──────────┬──────────────────────────────────────────┐   │ │
│  │  │ Patient  │          Timeline Viewport              │   │ │
│  │  │ Rail     │  (pan horizontal, scroll vertical)      │   │ │
│  │  │ (sticky) │                                         │   │ │
│  │  │          │  ┌──────┬──────┬──────┬──────┬────────┐ │   │ │
│  │  │          │  │ Enc1 │ Gap1 │ Enc2 │ Gap2 │ Enc3 …│ │   │ │
│  │  │          │  ├──────┼──────┼──────┼──────┼────────┤ │   │ │
│  │  │          │  │      (Track Rows)                   │ │   │ │
│  │  │          │  │  - Diagnoses (continuous)          │ │   │ │
│  │  │          │  │  - Medications (continuous)        │ │   │ │
│  │  │          │  │  - Labs (point-in-time)            │ │   │ │
│  │  │          │  │  - Vitals (point-in-time)          │ │   │ │
│  │  │          │  └──────┴──────┴──────┴──────┴────────┘ │   │ │
│  │  └──────────┴──────────────────────────────────────────┘   │ │
│  │                                                              │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Component Architecture

### Core Components

**App.tsx**
- Root container; loads `patient.demo.json`.
- Instantiates Timeline and manages global state (patient data, current viewport position).

**Timeline.tsx**
- Main layout: sticky rails, panning viewport, track stack.
- Manages segment array (encounters + gaps).
- Delegates rendering to TrackStack.

**SegmentArray.ts** (utility)
- Computes encounters + gap segments from patient data.
- Assigns magnitude labels (<1, N Months, etc.).
- Returns ordered array of `Segment` objects.

**TrackStack.tsx**
- Renders all 4 domain tracks in vertical order.
- Scrolls vertically.
- Manages press-and-hold state for each cell.

**Track.tsx** (generic domain track)
- Renders one domain (Diagnoses, Medications, Labs, Vitals).
- Iterates over subtypes and renders SubtypeRow for each.
- Handles continuous vs. point-in-time logic.

**SubtypeRow.tsx**
- Renders one subtype (e.g., HR, BP for Vitals).
- Iterates over segments and renders Cell for each segment.

**Cell.tsx**
- Renders one cell (intersection of subtype × segment).
- Handles press-and-hold (mousedown/mouseup, touchstart/touchend).
- Triggers Peek Card on hold.
- Triggers Context Highlight on hover (optional) or hold.

**PeekCard.tsx**
- Modal overlay; displays on press-and-hold.
- Content depends on cell type (encounter, gap, data point).
- Dismisses on mouseup/touchend.

**ContextHighlight.tsx** (visual effect)
- Subtle column wash applied to all cells in a segment column.
- CSS classes for styling; no DOM elements, just CSS.

### Data Structures

**Segment**
```ts
type Segment = {
  id: string;                // "enc-2023-01-10" or "gap-0001"
  type: "encounter" | "gap";
  date?: string;             // ISO date (encounter only)
  startDate?: string;        // ISO date (gap only)
  endDate?: string;          // ISO date (gap only)
  durationDays?: number;
  magnitude?: "minimal" | "moderate" | "extended";
  label: string;             // "<1", "2 Months", "5 Months", or date
  encounterId?: string;      // reference to encounter data
};
```

**CellData** (rendered content for a cell)
```ts
type CellData = {
  segmentId: string;
  subtypeId: string;
  values: string | string[]; // rendered text/value(s)
  metadata?: Record<string, any>;
};
```

## State Management

**Minimal:** Use React hooks (useState, useContext).
- `patientData`: loaded JSON
- `segments`: computed segment array
- `scrollX`: current horizontal pan position
- `scrollY`: current vertical scroll position
- `pressHoldCell`: current cell under press-and-hold (for Peek Card)
- `contextHighlightSegmentId`: current segment for column highlight

No Redux or Zustand for MVP; context is simple enough.

## Interaction Flow

### Horizontal Pan
1. User drags in timeline viewport.
2. `mousemove` / `touchmove` event updates `scrollX`.
3. TrackStack re-renders with updated `transform: translateX()`.

### Vertical Scroll
1. User scrolls TrackStack.
2. `wheel` / `scroll` event updates `scrollY`.
3. Native CSS `overflow-y: auto` handles scrolling.

### Press-and-Hold (Peek Card)
1. User `mousedown` / `touchstart` on a cell.
2. Timer starts (500ms for press-and-hold).
3. If timer completes before `mouseup` / `touchend`, show Peek Card.
4. Peek Card displays until release.
5. On `mouseup` / `touchend`, timer clears and Peek Card hides.

### Context Highlight
1. User hovers over a cell (optional: desktop only) OR holds (required: all devices).
2. Extract `segmentId` from cell.
3. Add CSS class to all cells with matching `segmentId`.
4. Dismiss on mouse leave or release.

## Styling

**CSS Approach:** Tailwind CSS (utility-first) + custom CSS for layout and interaction states.

**Key Classes:**
- `segment-column`: fixed-width column for each segment.
- `cell`: intersection of subtype × segment.
- `cell.hover`: subtle background (Context Highlight).
- `cell.press`: highlight state during press-and-hold.
- `peek-card`: modal overlay.

**No Hover Tooltips:** All hover CSS is purely visual alignment (Context Highlight); no tooltips.

## File Structure

```
src/
├── App.tsx
├── components/
│   ├── Timeline.tsx
│   ├── TrackStack.tsx
│   ├── Track.tsx
│   ├── SubtypeRow.tsx
│   ├── Cell.tsx
│   ├── PeekCard.tsx
│   └── ContextHighlight.tsx (or style-only)
├── utils/
│   ├── segmentArray.ts
│   ├── types.ts
│   └── helpers.ts (date math, formatting)
├── data/
│   └── patient.demo.json
├── styles/
│   └── index.css (Tailwind + custom CSS)
└── main.tsx (entry point)
```

## Browser APIs Used

- `mousedown`, `mouseup`, `mousemove`: pointer tracking (desktop).
- `touchstart`, `touchend`, `touchmove`: touch tracking (future).
- `setTimeout` / `clearTimeout`: press-and-hold timer.
- `CSS` transforms: smooth pan (no forced reflow).

## Performance Considerations

- **Rendering:** All cells pre-computed; no virtual scrolling in MVP (assumed ~10–20 encounters).
- **Pan:** Use CSS `transform` (GPU-accelerated); avoid re-layout.
- **Press-and-Hold:** 500ms debounce to distinguish from accidental hovers/pan start.

## Future Extensibility

- Zoom: Add pinch detection; scale segments dynamically.
- Multi-patient: Add patient selector; swap data.
- Real-time: Inject live encounter updates into segment array.
- Custom domain order: Add UI to reorder tracks.
