import { useMemo } from 'react'
import { Segment } from '../utils/types'
import { getGapWidth } from '../utils/helpers'

interface TimelineRulerProps {
  segments: Segment[]
  contextHighlightSegmentId?: string
}

const TimelineRuler = ({ segments, contextHighlightSegmentId }: TimelineRulerProps) => {
  // Generate grid template columns matching TrackStack
  const gridTemplateColumns = useMemo(() => {
    return segments.map(segment => {
      if (segment.type === 'encounter') {
        return 'minmax(120px, 1fr)'
      } else {
        const minWidth = getGapWidth(segment.durationDays || 0)
        return `minmax(${minWidth}px, 1fr)`
      }
    }).join(' ')
  }, [segments])

  return (
    <div 
      className="timeline-ruler"
      style={{ display: 'grid', gridTemplateColumns }}
    >
      {segments.map((segment) => (
        <div
          key={segment.id}
          className={`timeline-segment ${segment.type === 'gap' ? 'gap' : 'encounter'} ${
            contextHighlightSegmentId === segment.id ? 'context-highlighted' : ''
          }`}
        >
          {segment.label}
        </div>
      ))}
    </div>
  )
}

export default TimelineRuler