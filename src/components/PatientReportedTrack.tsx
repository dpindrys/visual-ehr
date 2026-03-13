import { useMemo, useRef, useCallback } from 'react'
import { PatientData, Segment, PatientReportedEntry } from '../utils/types'
import { findSegmentIndexForDateWithGaps } from '../utils/helpers'

const PRO_SUBTYPES = ['fatigue', 'pain', 'functional_limitation', 'distress'] as const

interface PatientReportedTrackProps {
  patientData: PatientData
  segments: Segment[]
  highlightedRow?: { trackName: string; subtypeName: string } | null
  isPressHeld?: boolean
  hiddenSubtypes?: Set<string>
  contextHighlightSegmentId?: string
  onContextHighlight?: (segmentId?: string) => void
}

const PatientReportedTrack = ({
  patientData,
  segments,
  highlightedRow,
  isPressHeld = false,
  hiddenSubtypes = new Set(),
  contextHighlightSegmentId,
  onContextHighlight,
}: PatientReportedTrackProps) => {
  const entries: PatientReportedEntry[] = patientData.patientReported || []
  const trackHeight = 32 * 4
  const padding = { top: 6, bottom: 6 }
  const chartHeight = trackHeight - padding.top - padding.bottom
  const columnWidth = segments.length > 0 ? 100 / segments.length : 0

  const mappedEntries = useMemo(
    () =>
      segments.length === 0
        ? []
        : entries
            .map((entry) => {
              const segIndex = findSegmentIndexForDateWithGaps(segments, entry.date)
              const x = (segIndex + 0.5) * columnWidth
              return { ...entry, segIndex, x }
            })
            .sort((a, b) => a.date.localeCompare(b.date)),
    [entries, segments]
  )

  const lineData = useMemo(
    () =>
      PRO_SUBTYPES.map((subtype) => {
        const points = mappedEntries
          .filter((e) => e[subtype] !== undefined && e[subtype] !== null)
          .map((e) => {
            const value = e[subtype] as number
            const normalizedY = value / 10
            const y = padding.top + chartHeight * (1 - normalizedY)
            return { x: e.x, y, value, source: e.source, date: e.date }
          })
          .sort((a, b) => a.x - b.x)

        const deduped = points.filter(
          (p, i) => i === points.length - 1 || p.x !== points[i + 1].x
        )

        if (deduped.length > 0) {
          const extended = [...deduped]
          if (extended[0].x > 0) extended.unshift({ ...extended[0], x: 0 })
          if (extended[extended.length - 1].x < 100) {
            extended.push({ ...extended[extended.length - 1], x: 100 })
          }
          return { subtype, points: extended }
        }

        return { subtype, points }
      }),
    [mappedEntries, chartHeight, padding.top]
  )

  const severityGuides = useMemo(
    () => [
      { label: 'Severe', y: padding.top + chartHeight * (1 - 10 / 10) },
      { label: 'Moderate', y: padding.top + chartHeight * (1 - 6 / 10) },
      { label: 'Mild', y: padding.top + chartHeight * (1 - 3 / 10) },
      { label: 'None', y: padding.top + chartHeight * (1 - 0 / 10) },
    ],
    [chartHeight, padding.top]
  )

  const isTrackHighlighted = highlightedRow?.trackName === 'patient_reported'
  const highlightedSubtype = isTrackHighlighted ? highlightedRow?.subtypeName : null

  const getLineStyle = (subtype: string) => {
    if (hiddenSubtypes.has(`patient_reported-${subtype}`)) {
      return { color: '#9ca3af', width: 1, opacity: 0 }
    }
    if (isTrackHighlighted) {
      if (highlightedSubtype === subtype) {
        return isPressHeld
          ? { color: '#111827', width: 2.5, opacity: 1 }
          : { color: '#374151', width: 2, opacity: 1 }
      }
      return { color: '#9ca3af', width: 1, opacity: isPressHeld ? 0.15 : 0.35 }
    }
    return { color: '#6b7280', width: 1, opacity: 0.75 }
  }

  const svgRef = useRef<SVGSVGElement>(null)

  const highlightedColumnIndex = useMemo(
    () => (contextHighlightSegmentId ? segments.findIndex((s) => s.id === contextHighlightSegmentId) : -1),
    [contextHighlightSegmentId, segments]
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const svg = svgRef.current
      if (!svg || segments.length === 0) return
      const rect = svg.getBoundingClientRect()
      const fraction = (e.clientX - rect.left) / rect.width
      const index = Math.max(0, Math.min(Math.floor(fraction * segments.length), segments.length - 1))
      const seg = segments[index]
      if (seg && seg.id !== contextHighlightSegmentId) {
        onContextHighlight?.(seg.id)
      }
    },
    [segments, contextHighlightSegmentId, onContextHighlight]
  )

  const handleMouseLeave = useCallback(() => {
    onContextHighlight?.(undefined)
  }, [onContextHighlight])

  return (
    <div className="pro-track" style={{ height: `${trackHeight}px` }}>
      <svg
        ref={svgRef}
        width="100%"
        height={trackHeight}
        className="pro-track-svg"
        viewBox={`0 0 100 ${trackHeight}`}
        preserveAspectRatio="none"
        style={{ position: 'absolute', top: 0, left: 0 }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {severityGuides.map((guide) => (
          <line
            key={guide.label}
            x1="0"
            y1={guide.y}
            x2="100"
            y2={guide.y}
            stroke="#e5e7eb"
            strokeWidth={0.5}
            strokeDasharray={guide.label === 'None' || guide.label === 'Severe' ? '' : '4,4'}
            vectorEffect="non-scaling-stroke"
          />
        ))}

        {highlightedColumnIndex >= 0 && (
          <rect
            x={highlightedColumnIndex * columnWidth}
            y={0}
            width={columnWidth}
            height={trackHeight}
            fill="none"
            stroke="#6b7280"
            strokeWidth={2}
            vectorEffect="non-scaling-stroke"
            style={{ pointerEvents: 'none' }}
          />
        )}

        {lineData.map(({ subtype, points }) => {
          if (hiddenSubtypes.has(`patient_reported-${subtype}`) || points.length === 0) return null
          const style = getLineStyle(subtype)

          return (
            <g
              key={subtype}
              className={`pro-line-group ${highlightedSubtype === subtype ? 'highlighted' : ''}`}
              style={{ opacity: style.opacity, transition: 'opacity 0.2s ease' }}
            >
              {points.map((point, i) => {
                if (i === 0) return null
                const prev = points[i - 1]
                return (
                  <line
                    key={`line-${subtype}-${i}`}
                    x1={prev.x}
                    y1={prev.y}
                    x2={point.x}
                    y2={point.y}
                    stroke={style.color}
                    strokeWidth={style.width}
                    fill="none"
                    vectorEffect="non-scaling-stroke"
                    style={{ transition: 'stroke-width 0.2s ease, stroke 0.2s ease' }}
                  />
                )
              })}
            </g>
          )
        })}
      </svg>
    </div>
  )
}

export default PatientReportedTrack
