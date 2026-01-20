import { PatientData, Segment, PeekCardState } from '../utils/types'
import SubtypeRow from './SubtypeRow'

interface TrackProps {
  trackName: string
  patientData: PatientData
  segments: Segment[]
  contextHighlightSegmentId?: string
  onContextHighlight: (segmentId?: string) => void
  onPeekCard: (state: PeekCardState) => void
  highlightedRow?: { trackName: string; subtypeName: string } | null
}

const Track = ({
  trackName,
  patientData,
  segments,
  contextHighlightSegmentId,
  onContextHighlight,
  onPeekCard,
  highlightedRow,
}: TrackProps) => {
  const trackConfig = patientData.domainConfig.tracks[trackName]

  if (!trackConfig) return null

  return (
    <div className="track-row">
      {trackConfig.subtypes.map((subtype) => {
        const isRowHighlighted = highlightedRow?.trackName === trackName && highlightedRow?.subtypeName === subtype
        return (
          <SubtypeRow
            key={`${trackName}-${subtype}`}
            trackName={trackName}
            subtypeName={subtype}
            patientData={patientData}
            segments={segments}
            contextHighlightSegmentId={contextHighlightSegmentId}
            onContextHighlight={onContextHighlight}
            onPeekCard={onPeekCard}
            isRowHighlighted={isRowHighlighted}
          />
        )
      })}
    </div>
  )
}

export default Track
