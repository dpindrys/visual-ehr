import { useMemo, useState } from 'react'
import { PatientData, Segment, MedicationPeriod, DoseSegment } from '../utils/types'
import { filterMedicationsBySubtype } from '../utils/continuousStateEngine'
import { findSegmentIndexForDate } from '../utils/helpers'
import Tooltip from './Tooltip'

interface MedicationsTrackProps {
  patientData: PatientData
  segments: Segment[]
  medicationPeriods: MedicationPeriod[]
  highlightedRow?: { trackName: string; subtypeName: string } | null
  contextHighlightSegmentId?: string
  onContextHighlight?: (segmentId?: string) => void
  hiddenSubtypes?: Set<string>
}

interface MappedDoseBar {
  period: MedicationPeriod
  doseSegment: DoseSegment
  startIndex: number
  endIndex: number
  startsBeforeVisible: boolean
  endsAfterVisible: boolean
  isOngoing: boolean
}

interface CellState {
  type: 'empty' | 'bar-start' | 'bar-end' | 'bar-middle' | 'bar-only'
  bar?: MappedDoseBar
  isGap: boolean
}

interface MedTooltipState {
  isVisible: boolean
  period: MedicationPeriod | null
  doseSegment: DoseSegment | null
  x: number
  y: number
}

const MedicationsTrack = ({
  patientData,
  segments,
  medicationPeriods,
  highlightedRow,
  contextHighlightSegmentId,
  onContextHighlight,
  hiddenSubtypes = new Set(),
}: MedicationsTrackProps) => {
  const trackConfig = patientData.domainConfig.tracks.medications
  if (!trackConfig) return null

  const [tooltip, setTooltip] = useState<MedTooltipState>({
    isVisible: false,
    period: null,
    doseSegment: null,
    x: 0,
    y: 0,
  })

  const encounterToSegmentIndex = useMemo(() => {
    const map = new Map<string, number>()
    segments.forEach((seg, i) => {
      if (seg.type === 'encounter' && seg.encounterId) map.set(seg.encounterId, i)
    })
    return map
  }, [segments])

  const visibleDateRange = useMemo(() => {
    const encounters = segments.filter((s) => s.type === 'encounter' && s.date)
    return encounters.length === 0
      ? { start: '', end: '' }
      : { start: encounters[0].date!, end: encounters[encounters.length - 1].date! }
  }, [segments])

  const handlePressStart = (e: React.MouseEvent, period: MedicationPeriod, doseSegment: DoseSegment) => {
    e.preventDefault()
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    setTooltip({
      isVisible: true,
      period,
      doseSegment,
      x: rect.left + rect.width / 2,
      y: rect.top,
    })
  }

  const handlePressEnd = () => {
    setTooltip((prev) => ({ ...prev, isVisible: false }))
  }

  return (
    <>
      <div className="medication-track">
        {trackConfig.subtypes.map((subtype) => {
          if (hiddenSubtypes.has(`medications-${subtype}`)) return null
          const isRowHighlighted =
            highlightedRow?.trackName === 'medications' && highlightedRow?.subtypeName === subtype
          const periods = filterMedicationsBySubtype(medicationPeriods, subtype)

          return (
            <MedicationRow
              key={subtype}
              periods={periods}
              segments={segments}
              encounterToSegmentIndex={encounterToSegmentIndex}
              visibleDateRange={visibleDateRange}
              isRowHighlighted={isRowHighlighted}
              contextHighlightSegmentId={contextHighlightSegmentId}
              onContextHighlight={onContextHighlight}
              onPressStart={handlePressStart}
              onPressEnd={handlePressEnd}
            />
          )
        })}
      </div>

      {tooltip.isVisible && tooltip.period && tooltip.doseSegment && (
        <Tooltip
          type="medication-cell"
          medicationPeriod={tooltip.period}
          doseSegment={tooltip.doseSegment}
          x={tooltip.x}
          y={tooltip.y}
          position="top"
        />
      )}
    </>
  )
}

interface MedicationRowProps {
  periods: MedicationPeriod[]
  segments: Segment[]
  encounterToSegmentIndex: Map<string, number>
  visibleDateRange: { start: string; end: string }
  isRowHighlighted: boolean
  contextHighlightSegmentId?: string
  onContextHighlight?: (segmentId?: string) => void
  onPressStart: (e: React.MouseEvent, period: MedicationPeriod, doseSegment: DoseSegment) => void
  onPressEnd: () => void
}

const MedicationRow = ({
  periods,
  segments,
  encounterToSegmentIndex,
  visibleDateRange,
  isRowHighlighted,
  contextHighlightSegmentId,
  onContextHighlight,
  onPressStart,
  onPressEnd,
}: MedicationRowProps) => {
  const [pressedCellId, setPressedCellId] = useState<string | null>(null)

  const mappedDoseBars = useMemo(() => {
    const bars: MappedDoseBar[] = []
    for (const period of periods) {
      for (const dose of period.doseSegments) {
        let startIndex = encounterToSegmentIndex.get(dose.startEncounterId)
        let startsBeforeVisible = false
        if (startIndex === undefined) {
          if (dose.startDate < visibleDateRange.start) {
            startIndex = 0
            startsBeforeVisible = true
          } else if (dose.startDate > visibleDateRange.end) {
            continue
          } else {
            startIndex = findSegmentIndexForDate(segments, dose.startDate)
          }
        }

        let endIndex: number | undefined
        let endsAfterVisible = false
        let isOngoing = false

        if (dose.endEncounterId != null && dose.endDate) {
          endIndex = encounterToSegmentIndex.get(dose.endEncounterId)
          if (endIndex === undefined) {
            if (dose.endDate < visibleDateRange.start) continue
            if (dose.endDate > visibleDateRange.end) {
              endIndex = segments.length - 1
              endsAfterVisible = true
            } else {
              endIndex = findSegmentIndexForDate(segments, dose.endDate)
            }
          }
        } else {
          endIndex = segments.length - 1
          isOngoing = true
          endsAfterVisible = true
        }

        if (endIndex === undefined || endIndex < startIndex) continue

        bars.push({
          period,
          doseSegment: dose,
          startIndex,
          endIndex,
          startsBeforeVisible,
          endsAfterVisible,
          isOngoing,
        })
      }
    }
    return bars
  }, [periods, encounterToSegmentIndex, segments.length, visibleDateRange])

  const cellStates = useMemo(() => {
    const cells: CellState[] = segments.map((seg) => ({
      type: 'empty' as const,
      bar: undefined,
      isGap: seg.type === 'gap',
    }))

    mappedDoseBars.forEach((bar) => {
      const { startIndex, endIndex } = bar
      for (let i = startIndex; i <= endIndex; i++) {
        const isStart = i === startIndex
        const isEnd = i === endIndex
        cells[i] = {
          type: isStart && isEnd ? 'bar-only' : isStart ? 'bar-start' : isEnd ? 'bar-end' : 'bar-middle',
          bar,
          isGap: segments[i].type === 'gap',
        }
      }
    })

    return cells
  }, [mappedDoseBars, segments])

  return (
    <div className={`medication-row ${isRowHighlighted ? 'row-highlighted' : ''}`}>
      {cellStates.map((cell, i) => {
        const seg = segments[i]
        const isHighlighted = contextHighlightSegmentId === seg.id
        const isPressed = pressedCellId === seg.id

        if (cell.type === 'empty') {
          return (
            <div
              key={seg.id}
              className={`medication-cell ${cell.isGap ? 'gap-cell' : ''} ${isHighlighted ? 'context-highlighted' : ''}`}
              onMouseEnter={() => onContextHighlight?.(seg.id)}
              onMouseLeave={() => onContextHighlight?.(undefined)}
            />
          )
        }

        const bar = cell.bar!
        const { doseSegment, startsBeforeVisible, isOngoing } = bar
        const isBarStart = cell.type === 'bar-start' || cell.type === 'bar-only'
        const isBarEnd = cell.type === 'bar-end' || cell.type === 'bar-only'
        const showDoseLabel = isBarStart && !startsBeforeVisible

        return (
          <div
            key={seg.id}
            className={`medication-cell with-bar ${cell.isGap ? 'gap-cell' : ''} ${isHighlighted ? 'context-highlighted' : ''} ${isPressed ? 'press-held' : ''}`}
            onMouseEnter={() => onContextHighlight?.(seg.id)}
            onMouseLeave={() => {
              onContextHighlight?.(undefined)
              if (isPressed) {
                setPressedCellId(null)
                onPressEnd()
              }
            }}
            onMouseDown={(e) => {
              setPressedCellId(seg.id)
              onPressStart(e, bar.period, doseSegment)
            }}
            onMouseUp={() => {
              setPressedCellId(null)
              onPressEnd()
            }}
          >
            <div
              className={`medication-bar-segment dose-${doseSegment.therapeuticLevel} ${isBarStart ? 'bar-start' : ''} ${isBarEnd ? 'bar-end' : ''} ${isOngoing && isBarEnd ? 'ongoing' : ''} ${startsBeforeVisible && isBarStart ? 'starts-before' : ''}`}
            >
              {showDoseLabel && (
                <span className="medication-dose-label">{doseSegment.dose}</span>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default MedicationsTrack
