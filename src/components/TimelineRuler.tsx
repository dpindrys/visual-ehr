import { Segment } from '../utils/types'
import { getGapWidth } from '../utils/helpers'

interface TimelineRulerProps {
  segments: Segment[]
  contextHighlightSegmentId?: string
}

const TimelineRuler = ({ segments, contextHighlightSegmentId }: TimelineRulerProps) => {
  // Calculate width for each segment
  const getSegmentWidth = (segment: Segment): number => {
    if (segment.type === 'encounter') {
      return 120
    } else {
      return getGapWidth(segment.durationDays || 0)
    }
  }

  return (
    <div className="timeline-ruler">
      {segments.map((segment) => {
        const width = getSegmentWidth(segment)
        return (
          <div
            key={segment.id}
            className={`timeline-segment ${segment.type === 'gap' ? 'gap' : 'encounter'} ${
              contextHighlightSegmentId === segment.id ? 'context-highlighted' : ''
            }`}
            style={{ width: `${width}px`, flexShrink: 0 }}
          >
            {segment.label}
          </div>
        )
      })}
    </div>
  )
}

export default TimelineRuler