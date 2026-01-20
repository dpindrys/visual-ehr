import { PatientData, Segment, PeekCardState, Encounter } from '../utils/types'
import Cell from './Cell'

interface SubtypeRowProps {
  trackName: string
  subtypeName: string
  patientData: PatientData
  segments: Segment[]
  contextHighlightSegmentId?: string
  onContextHighlight: (segmentId?: string) => void
  onPeekCard: (state: PeekCardState) => void
  isRowHighlighted?: boolean
}

const SubtypeRow = ({
  trackName,
  subtypeName,
  patientData,
  segments,
  contextHighlightSegmentId,
  onContextHighlight,
  onPeekCard,
  isRowHighlighted,
}: SubtypeRowProps) => {
  return (
    <div className={`subtype-row ${isRowHighlighted ? 'row-highlighted' : ''}`}>
      {segments.map((segment) => {
        let encounter: Encounter | undefined
        if (segment.type === 'encounter' && segment.encounterId) {
          encounter = patientData.encounters.find((e) => e.id === segment.encounterId)
        }

        return (
          <Cell
            key={`${segment.id}-${subtypeName}`}
            segment={segment}
            encounter={encounter}
            trackName={trackName}
            subtypeName={subtypeName}
            patientData={patientData}
            segments={segments}
            isHighlighted={contextHighlightSegmentId === segment.id}
            onContextHighlight={onContextHighlight}
            onPeekCard={onPeekCard}
          />
        )
      })}
    </div>
  )
}

export default SubtypeRow
