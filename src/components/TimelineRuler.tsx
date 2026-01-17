import { Segment } from '../utils/types'

interface TimelineRulerProps {
  segments: Segment[]
}

const TimelineRuler = ({ segments }: TimelineRulerProps) => {
  return (
    <div className="timeline-ruler">
      {segments.map((segment) => (
        <div
          key={segment.id}
          className={`timeline-segment ${segment.type === 'gap' ? 'gap' : 'encounter'}`}
        >
          {segment.label}
        </div>
      ))}
    </div>
  )
}

export default TimelineRuler
