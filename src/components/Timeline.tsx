import { useState, useMemo } from 'react'
import { PatientData, Segment } from '../utils/types'
import { generateSegmentArray } from '../utils/segmentArray'
import PatientRail from './PatientRail'
import TrackStack from './TrackStack'

interface TimelineProps {
  patientData: PatientData
}

const Timeline = ({ patientData }: TimelineProps) => {
  const [scrollX, setScrollX] = useState(0)
  const [contextHighlightSegmentId, setContextHighlightSegmentId] = useState<string | undefined>()

  const segments: Segment[] = useMemo(() => {
    return generateSegmentArray(patientData)
  }, [patientData])

  return (
    <div className="timeline-content">
      {/* Sticky Patient Rail */}
      <PatientRail patient={patientData.patient} />

      {/* Timeline Viewport */}
      <div className="timeline-viewport">
        <div
          className="timeline-scroll-container"
          style={{ transform: `translateX(-${scrollX}px)` }}
        >
          <TrackStack
            patientData={patientData}
            segments={segments}
            onScrollX={setScrollX}
            onContextHighlight={setContextHighlightSegmentId}
            contextHighlightSegmentId={contextHighlightSegmentId}
          />
        </div>
      </div>
    </div>
  )
}

export default Timeline
