import { useMemo, useState } from 'react'
import { PatientData, Segment } from '../utils/types'
import { bucketProEntries, ProBucket } from '../utils/proBuckets'
import { getEncounterByDate } from '../utils/segmentArray'
import ProCell from './ProCell'
import Tooltip from './Tooltip'

const PRO_SUBTYPES = ['fatigue', 'pain', 'functional_limitation', 'distress'] as const

interface ProTooltipState {
  isVisible: boolean
  type: 'pro-cell-encounter' | 'pro-cell-gap'
  subtype: string
  bucket: ProBucket | null
  segment: Segment | null
  x: number
  y: number
}

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

  const [tooltip, setTooltip] = useState<ProTooltipState>({
    isVisible: false,
    type: 'pro-cell-encounter',
    subtype: '',
    bucket: null,
    segment: null,
    x: 0,
    y: 0,
  })

  const bucketsBySubtype = useMemo(() => {
    const map = new Map<string, Map<string, ProBucket>>()
    for (const subtype of PRO_SUBTYPES) {
      map.set(subtype, bucketProEntries(entries, segments, subtype))
    }
    return map
  }, [entries, segments])

  const handlePressStart = (
    e: React.MouseEvent,
    subtype: string,
    bucket: ProBucket,
    seg: Segment
  ) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const tooltipType = seg.type === 'encounter' ? 'pro-cell-encounter' : 'pro-cell-gap'
    setTooltip({
      isVisible: true,
      type: tooltipType,
      subtype,
      bucket,
      segment: seg,
      x: rect.left + rect.width / 2,
      y: rect.top,
    })
  }

  const handlePressEnd = () => {
    setTooltip((prev) => ({ ...prev, isVisible: false }))
  }

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
            {segments.map((seg) => {
              const bucket = buckets.get(seg.id)
              return (
                <ProCell
                  key={seg.id}
                  bucket={bucket}
                  isHighlighted={contextHighlightSegmentId === seg.id}
                  segmentId={seg.id}
                  onContextHighlight={onContextHighlight}
                  onPressStart={bucket ? (e) => handlePressStart(e, subtype, bucket, seg) : undefined}
                  onPressEnd={handlePressEnd}
                />
              )
            })}
          </div>
        )
      })}

      {tooltip.isVisible && tooltip.bucket && tooltip.segment && (() => {
        if (tooltip.type === 'pro-cell-encounter') {
          const encounter = getEncounterByDate(patientData, tooltip.segment.date || '')
          if (!encounter) return null
          return (
            <Tooltip
              type="pro-cell-encounter"
              proBucket={tooltip.bucket}
              proSubtype={tooltip.subtype}
              encounter={encounter}
              x={tooltip.x}
              y={tooltip.y}
              position="top"
            />
          )
        }
        return (
          <Tooltip
            type="pro-cell-gap"
            proBucket={tooltip.bucket}
            proSubtype={tooltip.subtype}
            segment={tooltip.segment}
            x={tooltip.x}
            y={tooltip.y}
            position="top"
          />
        )
      })()}
    </>
  )
}

export default PatientReportedTrack
