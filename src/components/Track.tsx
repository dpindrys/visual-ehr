import { PatientData, Segment, PeekCardState } from '../utils/types'
import SubtypeRow from './SubtypeRow'

interface TrackProps {
  trackName: string
  patientData: PatientData
  segments: Segment[]
  contextHighlightSegmentId?: string
  onContextHighlight: (segmentId?: string) => void
  onPeekCard: (state: PeekCardState) => void
}

const Track = ({
  trackName,
  patientData,
  segments,
  contextHighlightSegmentId,
  onContextHighlight,
  onPeekCard,
}: TrackProps) => {
  const trackConfig = patientData.domainConfig.tracks[trackName]

  if (!trackConfig) return null

  // Format track name for display
  const displayName = trackName.charAt(0).toUpperCase() + trackName.slice(1)

  return (
    <div className="track-row">
      <div className="track-label">{displayName}</div>

      {trackConfig.subtypes.map((subtype) => (
        <SubtypeRow
          key={`${trackName}-${subtype}`}
          trackName={trackName}
          subtypeName={subtype}
          patientData={patientData}
          segments={segments}
          contextHighlightSegmentId={contextHighlightSegmentId}
          onContextHighlight={onContextHighlight}
          onPeekCard={onPeekCard}
        />
      ))}
    </div>
  )
}

export default Track
