# VisualEHR — Vision

VisualEHR is a compressed-time clinical timeline designed for rapid visual pattern recognition across a patient's longitudinal record.

## Mental Model: Compressed Time

The x-axis is **not continuous calendar time**. Instead, only **encounter days** take up space on screen. Dates without encounters are shown as **Gap Segments**, with a compact duration label visible directly in the cell and detailed information available on **press-and-hold**.

This compression means:
- A patient's 5-year record might fit on one screen
- Clinicians see dense, actionable data without calendar noise
- Temporal patterns (symptom onset, treatment response, disease progression) emerge visually

## Encounter Segments vs. Gap Segments

### Gap Segment Magnitude

Gap Segments are rendered using **three magnitude states**, based on clinically meaningful duration thresholds rather than raw calendar precision.

- **Minimal Gap (<1 month)**  
  Represents routine or administrative spacing between encounters. Displayed in a compact form (e.g., "<1").

- **Moderate Gap (1–3 months)**  
  Represents expected follow-up intervals for many chronic conditions. Displayed with a medium emphasis (e.g., "2 Months").

- **Extended Gap (≥4 months)**  
  Represents prolonged absence of clinical activity that may indicate a lapse in care. Displayed with greater visual emphasis (e.g., "5 Months").

The visual emphasis of Gap Segments encodes **clinical significance**, not exact time proportionality.

Gap Segment magnitude is always visible at a glance.  
Detailed information (exact dates, total duration, contextual notes) is available on **press-and-hold**.

### Encounter Segment

An **Encounter Segment** is a column representing one encounter day.
- Multiple Track Rows intersect this column, each showing data recorded *during* that encounter.
- Encounter segments have a fixed width (not proportional to calendar duration).

Together, segments form the **timeline spine**—the visible history of the patient's engagement with care.

## Encounters as Structural Spine

Encounters are not treated as a clinical domain. They form the **structural spine** of the timeline.

Encounter Segments define the x-axis and provide temporal alignment for all domains. While encounter metadata (date, visit type, location) may be displayed visually, encounters do not behave like other domains and are not rendered as a Track Row.

## Track Rows: Domains with Multiple Subtypes

A Track Row is a **clinical domain**, not a single data field. Each row can display multiple related values per encounter:

- **Vitals** row: HR, BP, SpO₂, Temperature (multiple readings per encounter)
- **Labs** row: TSH, A1c, glucose, potassium (multiple test results per encounter)
- **Diagnoses** row: multiple diagnoses recorded during one visit
- **Medications** row: multiple prescriptions from one encounter

Tracks render **within encounters**—data appears in the intersection of Track Row and Encounter Segment. This avoids redundant encounter containers and keeps focus on clinical content.

### Default Track Order (MVP)

Track Rows are ordered to match clinical reasoning priority:

1. Diagnoses (continuous)
2. Medications (continuous)
3. Labs (point-in-time)
4. Vitals (point-in-time)

This order reflects how clinicians typically orient: problems first, then treatments, then objective data.


## Continuous Domains vs. Point-in-Time Domains

Not all clinical domains behave the same over time.

### Point-in-Time Domains (Discrete)

Some domains are recorded as discrete observations tied to a specific encounter. They appear only in the Encounter Segment where they were captured and do not persist across gaps.

Examples:
- Vitals
- Labs / testing results

### Continuous Domains (Persistent)

Other domains represent ongoing clinical states or treatments. These domains persist over time and must remain visually present across Encounter Segments and Gap Segments until they are explicitly changed, resolved, or discontinued in a later encounter.

Examples:
- Diagnoses / problem list items
- Medications / prescriptions

Behavior:
- A continuous item begins at the encounter where it is first introduced (or first observed).
- It remains visible across subsequent encounters and gaps.
- It ends only when an encounter explicitly marks it as resolved/discontinued (or replaced).
- Changes (e.g., medication dose changes) must be visually legible without hover; interaction only deepens detail.

## Why Press-and-Hold, Not Hover

The MVP uses **press-and-hold** (long press on touch; click-hold on desktop) to inspect details:

- **Hover is fragile:** Clinicians move a mouse while scanning; accidental hovers clutter the screen.
- **Press-and-hold is intentional:** It signals "I want to examine this data" and prevents noise.
- **Touch-native:** Works consistently on tablets and desktops alike.
- **Stateful:** Peek card remains visible while the hand is held; releasing dismisses it.

No zoom is supported in MVP. Horizontal pan (drag) moves the timeline left/right. Vertical scroll moves through Track Rows. This keeps the interaction simple and focused.

## What Success Means

A clinician succeeds when they can:

1. **Scan the timeline in seconds:** Compressed time reveals patterns (e.g., lab spikes, symptom clusters) at a glance.
2. **Locate specific events rapidly:** A few horizontal drags and they've found the relevant encounter.
3. **Inspect and reason:** Press-and-hold to see details; click to intentionally mark relevance.
4. **Understand the clinical story:** Dense, organized data tells the trajectory—no hunting through tabs or calendars.

Success is measured by reduced cognitive load and increased pattern recognition speed, compared to traditional row-per-field EHR views.

## Success Criteria

The VisualEHR timeline is successful when a clinician can:
- Rapidly identify clusters of clinical activity and prolonged gaps in care
- See which domains (diagnoses, vitals, labs, medications) were active at each encounter
- Understand care continuity without scrolling through empty calendar time
- Access detail intentionally, without accidental or transient interactions
- Relate events across domains to spot patterns at a glance, then intentionally drill into details via interaction

## Cross-Domain Encounter Highlighting (Context Highlight)

To make same-day relationships instantly recognizable, VisualEHR provides a subtle **Context Highlight** that visually links all cells belonging to the same Encounter Segment across every Track Row.

Trigger:
- **Desktop:** pointer hover activates Context Highlight
- **Touch + Desktop:** **press-and-hold** activates Context Highlight (and may also open the Peek Card)

Behavior:
- The Encounter Segment column is lightly emphasized across all domains (e.g., a faint column wash and/or thin vertical guide)
- Cells within that encounter may receive a minimal outline to reinforce alignment
- The effect is intentionally subtle and non-blocking: it must not obscure values, shift layout, or visually "take over" the screen
- Context Highlight reveals **no new information**; it only clarifies alignment

This enables rapid cross-domain pattern recognition by making same-day correlations obvious with minimal visual disruption.

Context Highlight is a transient alignment aid, not a selection or focus state.
