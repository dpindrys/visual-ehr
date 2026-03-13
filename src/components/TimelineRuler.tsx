import { useMemo } from 'react'
import { Segment } from '../utils/types'
import { formatDateShort } from '../utils/helpers'

interface TimelineRulerProps {
  segments: Segment[]
  contextHighlightSegmentId?: string
  onContextHighlight?: (segmentId?: string) => void
}

const TimelineRuler = ({ segments, contextHighlightSegmentId, onContextHighlight }: TimelineRulerProps) => {
  const gridTemplateColumns = useMemo(() => {
    if (segments.length === 0) return ''
    const colWidth = 100 / segments.length
    return segments.map(() => `${colWidth}%`).join(' ')
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
          onMouseEnter={() => onContextHighlight?.(segment.id)}
          onMouseLeave={() => onContextHighlight?.(undefined)}
        >
          {segment.type === 'encounter' && segment.date
            ? formatDateShort(segment.date)
            : segment.label}
        </div>
      ))}
    </div>
  )
}

export default TimelineRuler
