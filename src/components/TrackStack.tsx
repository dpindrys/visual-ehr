import { useState, useMemo, useRef, forwardRef } from 'react'
import { PatientData, Segment, PeekCardState, VisibleTracks, DiagnosisPeriod, MedicationPeriod } from '../utils/types'
import { computeDiagnosisPeriods, computeMedicationPeriods } from '../utils/continuousStateEngine'
import Track from './Track'
import PatientReportedTrack from './PatientReportedTrack'
import DiagnosisTrack from './DiagnosisTrack'
import MedicationsTrack from './MedicationsTrack'
import PeekCard from './PeekCard'

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

  return (
    <div ref={ref || trackStackRef} className="track-stack">
      <div className="track-stack-content">
        <div className="timeline-grid" style={{ gridTemplateColumns }}>
          {trackOrder.map((trackName) => {
            if (!patientData.domainConfig.tracks[trackName]) return null

            return (
              <div key={trackName} className="track-with-header">
                <div className="domain-header-overlay">
                  <div
                    className="domain-header-span"
                    style={{ gridColumn: `1 / ${1 + segments.length}` }}
                  />
                </div>

                {trackName === 'patient_reported' ? (
                  <PatientReportedTrack
                    patientData={patientData}
                    segments={segments}
                    highlightedRow={highlightedRow}
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
    </div>
  )
})

TrackStack.displayName = 'TrackStack'

export default TrackStack
