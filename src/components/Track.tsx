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
  hiddenSubtypes?: Set<string>
}

const Track = ({
  trackName,
  patientData,
  segments,
  contextHighlightSegmentId,
  onContextHighlight,
  onPeekCard,
  highlightedRow,
  hiddenSubtypes = new Set(),
}: TrackProps) => {
  const trackConfig = patientData.domainConfig.tracks[trackName]
  if (!trackConfig) return null

  return (
    <div className="track-row">
      {trackConfig.subtypes.map((subtype) => {
        if (hiddenSubtypes.has(`${trackName}-${subtype}`)) return null
        const isRowHighlighted =
          highlightedRow?.trackName === trackName && highlightedRow?.subtypeName === subtype
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
