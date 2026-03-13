import { useState, useMemo, useRef, useCallback, forwardRef } from 'react'
import { PatientData, Segment, PeekCardState, VisibleTracks, DiagnosisPeriod, MedicationPeriod, PatientReportedEntry } from '../utils/types'
import { computeDiagnosisPeriods, computeMedicationPeriods } from '../utils/continuousStateEngine'
import { findSegmentIndexForDateWithGaps } from '../utils/helpers'
import Track from './Track'
import PatientReportedTrack from './PatientReportedTrack'
import DiagnosisTrack from './DiagnosisTrack'
import MedicationsTrack from './MedicationsTrack'
import PeekCard from './PeekCard'
import Tooltip from './Tooltip'

interface TrackStackProps {
  patientData: PatientData
  segments: Segment[]
  onContextHighlight: (segmentId?: string) => void
  contextHighlightSegmentId?: string
  highlightedRow?: { trackName: string; subtypeName: string } | null
  visibleTracks?: VisibleTracks
  hiddenSubtypes?: Set<string>
  isPressHeld?: boolean
}

const TrackStack = forwardRef<HTMLDivElement, TrackStackProps>(({
  patientData,
  segments,
  onContextHighlight,
  contextHighlightSegmentId,
  highlightedRow,
  visibleTracks = {
    patient_reported: true,
    diagnoses: true,
    encounters: true,
    vitals: true,
    labs: true,
  },
  hiddenSubtypes = new Set(),
  isPressHeld = false,
}, ref) => {
  const [peekCardState, setPeekCardState] = useState<PeekCardState>({ isVisible: false })
  const trackStackRef = useRef<HTMLDivElement>(null)

  const trackOrder = patientData.domainConfig.defaultTrackOrder.filter(
    (track) => visibleTracks[track] !== false
  )

  const diagnosisPeriods: DiagnosisPeriod[] = useMemo(
    () => computeDiagnosisPeriods(patientData),
    [patientData]
  )

  const medicationPeriods: MedicationPeriod[] = useMemo(
    () => computeMedicationPeriods(patientData),
    [patientData]
  )

  const gridTemplateColumns = useMemo(() => {
    if (segments.length === 0) return ''
    const colWidth = 100 / segments.length
    return segments.map(() => `${colWidth}%`).join(' ')
  }, [segments])

  const proNarrativesByColumn = useMemo(() => {
    const entries: PatientReportedEntry[] = patientData.patientReported || []
    if (entries.length === 0 || segments.length === 0) return new Map<number, PatientReportedEntry[]>()
    const map = new Map<number, PatientReportedEntry[]>()
    for (const entry of entries) {
      if (!entry.narrative) continue
      const segIndex = findSegmentIndexForDateWithGaps(segments, entry.date)
      const existing = map.get(segIndex) || []
      existing.push(entry)
      map.set(segIndex, existing)
    }
    return map
  }, [patientData, segments])

  const [proHeaderTooltip, setProHeaderTooltip] = useState<{
    isVisible: boolean; entries: PatientReportedEntry[]; x: number; y: number
  }>({ isVisible: false, entries: [], x: 0, y: 0 })

  const handleProHeaderPress = useCallback((e: React.MouseEvent, entries: PatientReportedEntry[]) => {
    e.preventDefault()
    const rect = e.currentTarget.getBoundingClientRect()
    setProHeaderTooltip({
      isVisible: true,
      entries,
      x: rect.left + rect.width / 2,
      y: rect.top,
    })
  }, [])

  const handleProHeaderRelease = useCallback(() => {
    setProHeaderTooltip((prev) => ({ ...prev, isVisible: false }))
  }, [])

  return (
    <div ref={ref || trackStackRef} className="track-stack">
      <div className="track-stack-content">
        <div className="timeline-grid" style={{ gridTemplateColumns }}>
          {trackOrder.map((trackName) => {
            if (!patientData.domainConfig.tracks[trackName]) return null

            return (
              <div key={trackName} className="track-with-header">
                <div className="domain-header-overlay">
                  {trackName === 'patient_reported' ? (
                    segments.map((seg, i) => {
                      const narrativeEntries = proNarrativesByColumn.get(i)
                      const hasNote = narrativeEntries && narrativeEntries.length > 0
                      return (
                        <div
                          key={seg.id}
                          className={`pro-header-cell ${hasNote ? 'has-note' : ''} ${contextHighlightSegmentId === seg.id ? 'context-highlighted' : ''}`}
                          onMouseEnter={() => onContextHighlight(seg.id)}
                          onMouseLeave={() => {
                            onContextHighlight(undefined)
                            if (hasNote) handleProHeaderRelease()
                          }}
                          onMouseDown={hasNote ? (e) => handleProHeaderPress(e, narrativeEntries!) : undefined}
                          onMouseUp={hasNote ? handleProHeaderRelease : undefined}
                        >
                          {hasNote && (
                            <svg className="pro-header-note-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M8 2v4" />
                              <path d="M12 2v4" />
                              <path d="M16 2v4" />
                              <rect width="16" height="18" x="4" y="4" rx="2" />
                              <path d="M8 10h6" />
                              <path d="M8 14h8" />
                              <path d="M8 18h5" />
                            </svg>
                          )}
                        </div>
                      )
                    })
                  ) : (
                    <div
                      className="domain-header-span"
                      style={{ gridColumn: `1 / ${1 + segments.length}` }}
                    />
                  )}
                </div>

                {trackName === 'patient_reported' ? (
                  <PatientReportedTrack
                    patientData={patientData}
                    segments={segments}
                    highlightedRow={highlightedRow}
                    isPressHeld={isPressHeld}
                    hiddenSubtypes={hiddenSubtypes}
                    contextHighlightSegmentId={contextHighlightSegmentId}
                    onContextHighlight={onContextHighlight}
                  />
                ) : trackName === 'diagnoses' ? (
                  <DiagnosisTrack
                    patientData={patientData}
                    segments={segments}
                    diagnosisPeriods={diagnosisPeriods}
                    highlightedRow={highlightedRow}
                    contextHighlightSegmentId={contextHighlightSegmentId}
                    onContextHighlight={onContextHighlight}
                    hiddenSubtypes={hiddenSubtypes}
                  />
                ) : trackName === 'medications' ? (
                  <MedicationsTrack
                    patientData={patientData}
                    segments={segments}
                    medicationPeriods={medicationPeriods}
                    highlightedRow={highlightedRow}
                    contextHighlightSegmentId={contextHighlightSegmentId}
                    onContextHighlight={onContextHighlight}
                    hiddenSubtypes={hiddenSubtypes}
                  />
                ) : (
                  <Track
                    trackName={trackName}
                    patientData={patientData}
                    segments={segments}
                    contextHighlightSegmentId={contextHighlightSegmentId}
                    onContextHighlight={onContextHighlight}
                    onPeekCard={setPeekCardState}
                    highlightedRow={highlightedRow}
                    hiddenSubtypes={hiddenSubtypes}
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {peekCardState.isVisible && <PeekCard state={peekCardState} />}

      {proHeaderTooltip.isVisible && proHeaderTooltip.entries.length > 0 && (
        <Tooltip
          type="patient-reported"
          patientReportedEntries={proHeaderTooltip.entries}
          x={proHeaderTooltip.x}
          y={proHeaderTooltip.y}
          position="top"
        />
      )}
    </div>
  )
})

TrackStack.displayName = 'TrackStack'

export default TrackStack
