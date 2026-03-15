import { useMemo } from 'react'
import { PatientData, Segment } from '../utils/types'
import { bucketProEntries } from '../utils/proBuckets'
import ProCell from './ProCell'

const PRO_SUBTYPES = ['fatigue', 'pain', 'functional_limitation', 'distress'] as const

interface PatientReportedTrackProps {
  patientData: PatientData
  segments: Segment[]
  highlightedRow?: { trackName: string; subtypeName: string } | null
  hiddenSubtypes?: Set<string>
  contextHighlightSegmentId?: string
  onContextHighlight?: (segmentId?: string) => void
}

const PatientReportedTrack = ({
  patientData,
  segments,
  highlightedRow,
  hiddenSubtypes = new Set(),
  contextHighlightSegmentId,
  onContextHighlight,
}: PatientReportedTrackProps) => {
  const entries = patientData.patientReported || []

  const bucketsBySubtype = useMemo(() => {
    const map = new Map<string, Map<string, ReturnType<typeof bucketProEntries> extends Map<string, infer V> ? V : never>>()
    for (const subtype of PRO_SUBTYPES) {
      map.set(subtype, bucketProEntries(entries, segments, subtype))
    }
    return map
  }, [entries, segments])

  return (
    <>
      {PRO_SUBTYPES.map((subtype) => {
        if (hiddenSubtypes.has(`patient_reported-${subtype}`)) return null

        const buckets = bucketsBySubtype.get(subtype)!
        const isRowHighlighted =
          highlightedRow?.trackName === 'patient_reported' &&
          highlightedRow?.subtypeName === subtype

        return (
          <div
            key={subtype}
            className={`pro-row ${isRowHighlighted ? 'row-highlighted' : ''}`}
          >
            {segments.map((seg) => (
              <ProCell
                key={seg.id}
                bucket={buckets.get(seg.id)}
                isHighlighted={contextHighlightSegmentId === seg.id}
                segmentId={seg.id}
                onContextHighlight={onContextHighlight}
              />
            ))}
          </div>
        )
      })}
    </>
  )
}

export default PatientReportedTrack
