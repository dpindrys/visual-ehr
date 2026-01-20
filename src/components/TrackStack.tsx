import { useState, useRef, useEffect, forwardRef, useMemo } from 'react'
import { PatientData, Segment, PeekCardState } from '../utils/types'
import { getGapWidth } from '../utils/helpers'
import Track from './Track'
import PeekCard from './PeekCard'

interface TrackStackProps {
  patientData: PatientData
  segments: Segment[]
  onContextHighlight: (segmentId?: string) => void
  contextHighlightSegmentId?: string
  highlightedRow?: { trackName: string; subtypeName: string } | null
}

const TrackStack = forwardRef<HTMLDivElement, TrackStackProps>(({
  patientData,
  segments,
  onContextHighlight,
  contextHighlightSegmentId,
  highlightedRow,
}, ref) => {
  const [peekCardState, setPeekCardState] = useState<PeekCardState>({ isVisible: false })
  const trackStackRef = useRef<HTMLDivElement>(null)

  // Close Peek Card when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (peekCardState.isVisible && !(e.target as HTMLElement).closest('.peek-card')) {
        setPeekCardState({ isVisible: false })
        onContextHighlight(undefined)
      }
    }

    if (peekCardState.isVisible) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [peekCardState.isVisible, onContextHighlight])

  const trackOrder = patientData.domainConfig.defaultTrackOrder

  // Generate dynamic grid column widths based on segment types
  // Uses minmax to fill available space while respecting minimums
  const gridTemplateColumns = useMemo(() => {
    return segments.map(segment => {
      if (segment.type === 'encounter') {
        return 'minmax(120px, 1fr)'
      } else {
        // Gap segment - min width based on duration
        const minWidth = getGapWidth(segment.durationDays || 0)
        return `minmax(${minWidth}px, 1fr)`
      }
    }).join(' ')
  }, [segments])

  return (
    <div
      ref={ref || trackStackRef}
      className="track-stack"
    >
      <div className="track-stack-content">
        <div 
          className="timeline-grid"
          style={{ gridTemplateColumns }}
        >
          {/* Domain Headers and Tracks */}
          {trackOrder.map((trackName) => {
            const trackConfig = patientData.domainConfig.tracks[trackName]
            if (!trackConfig) return null

            return (
              <div key={trackName} className="track-with-header">
                {/* Domain Header (Spans across grid) - Blank row for alignment with sidebar */}
                <div className="domain-header-overlay">
                  <div 
                    className="domain-header-span"
                    style={{ gridColumn: `1 / ${1 + segments.length}` }}
                  >
                    {/* Empty - domain label only appears in sidebar */}
                  </div>
                </div>
                {/* Track Subtypes */}
                <Track
                  trackName={trackName}
                  patientData={patientData}
                  segments={segments}
                  contextHighlightSegmentId={contextHighlightSegmentId}
                  onContextHighlight={onContextHighlight}
                  onPeekCard={setPeekCardState}
                  highlightedRow={highlightedRow}
                />
              </div>
            )
          })}
        </div>
      </div>

      {/* Peek Card */}
      {peekCardState.isVisible && <PeekCard state={peekCardState} />}
    </div>
  )
})

TrackStack.displayName = 'TrackStack'

export default TrackStack
