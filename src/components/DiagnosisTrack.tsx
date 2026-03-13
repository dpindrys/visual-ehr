import { useState, useMemo } from 'react'
import { PatientData, Segment, DiagnosisPeriod } from '../utils/types'
import { filterDiagnosisBySubtype } from '../utils/continuousStateEngine'
import { findSegmentIndexForDate } from '../utils/helpers'
import Tooltip from './Tooltip'

interface DiagnosisTrackProps {
  patientData: PatientData
  segments: Segment[]
  diagnosisPeriods: DiagnosisPeriod[]
  highlightedRow?: { trackName: string; subtypeName: string } | null
  contextHighlightSegmentId?: string
  onContextHighlight?: (segmentId?: string) => void
  hiddenSubtypes?: Set<string>
}

interface MappedPeriod {
  period: DiagnosisPeriod
  startIndex: number
  endIndex: number
  startsBeforeVisible: boolean
  endsAfterVisible: boolean
  isOngoing: boolean
  exacerbationBars: { startIndex: number; endIndex: number; label?: string }[]
  markers: number[]
}

interface CellState {
  type: 'empty' | 'bar-start' | 'bar-end' | 'bar-middle' | 'bar-only'
  bar?: MappedPeriod
  isGap: boolean
}

const DiagnosisTrack = ({
  patientData,
  segments,
  diagnosisPeriods,
  highlightedRow,
  contextHighlightSegmentId,
  onContextHighlight,
  hiddenSubtypes = new Set(),
}: DiagnosisTrackProps) => {
  const trackConfig = patientData.domainConfig.tracks.diagnoses
  if (!trackConfig) return null

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

  return (
    <div className="diagnosis-track">
      {trackConfig.subtypes.map((subtype) => {
        if (hiddenSubtypes.has(`diagnoses-${subtype}`)) return null
        const isRowHighlighted =
          highlightedRow?.trackName === 'diagnoses' && highlightedRow?.subtypeName === subtype
        const periods = filterDiagnosisBySubtype(diagnosisPeriods, subtype)

        return (
          <DiagnosisRow
            key={subtype}
            subtypeName={subtype}
            periods={periods}
            segments={segments}
            encounterToSegmentIndex={encounterToSegmentIndex}
            visibleDateRange={visibleDateRange}
            isRowHighlighted={isRowHighlighted}
            contextHighlightSegmentId={contextHighlightSegmentId}
            onContextHighlight={onContextHighlight}
          />
        )
      })}
    </div>
  )
}

interface DiagnosisRowProps {
  subtypeName: string
  periods: DiagnosisPeriod[]
  segments: Segment[]
  encounterToSegmentIndex: Map<string, number>
  visibleDateRange: { start: string; end: string }
  isRowHighlighted: boolean
  contextHighlightSegmentId?: string
  onContextHighlight?: (segmentId?: string) => void
}

const DiagnosisRow = ({
  periods,
  segments,
  encounterToSegmentIndex,
  visibleDateRange,
  isRowHighlighted,
  contextHighlightSegmentId,
  onContextHighlight,
}: DiagnosisRowProps) => {
  const [tooltipState, setTooltipState] = useState<{
    isVisible: boolean; period?: DiagnosisPeriod; x: number; y: number; position?: 'top' | 'right'
  }>({ isVisible: false, x: 0, y: 0 })

  const mappedPeriods = useMemo(() => {
    return periods
      .map((period) => {
        let startIndex = encounterToSegmentIndex.get(period.startEncounterId)
        let startsBeforeVisible = false
        if (startIndex === undefined) {
          if (period.startDate < visibleDateRange.start) {
            startIndex = 0
            startsBeforeVisible = true
          } else if (period.startDate > visibleDateRange.end) {
            return null
          } else {
            startIndex = findSegmentIndexForDate(segments, period.startDate)
          }
        }

        let endIndex: number | undefined
        let endsAfterVisible = false
        let isOngoing = false

        if (period.endEncounterId) {
          endIndex = encounterToSegmentIndex.get(period.endEncounterId)
          if (endIndex === undefined) {
            if (period.endDate && period.endDate < visibleDateRange.start) return null
            if (period.endDate && period.endDate > visibleDateRange.end) {
              endIndex = segments.length - 1
              endsAfterVisible = true
            } else if (period.endDate) {
              endIndex = findSegmentIndexForDate(segments, period.endDate)
            }
          }
        } else {
          endIndex = segments.length - 1
          isOngoing = true
          endsAfterVisible = true
        }

        if (endIndex === undefined || endIndex < startIndex) return null

        const exacerbationBars = period.exacerbations
          .map((exac) => {
            let eStart = encounterToSegmentIndex.get(exac.startEncounterId)
            if (eStart === undefined) {
              if (exac.startDate < visibleDateRange.start) eStart = 0
              else if (exac.startDate > visibleDateRange.end) return null
              else eStart = findSegmentIndexForDate(segments, exac.startDate)
            }
            let eEnd: number | undefined
            if (exac.endEncounterId) {
              eEnd = encounterToSegmentIndex.get(exac.endEncounterId)
              if (eEnd === undefined) {
                if (exac.endDate && exac.endDate < visibleDateRange.start) return null
                if (exac.endDate && exac.endDate > visibleDateRange.end) eEnd = segments.length - 1
                else if (exac.endDate) eEnd = findSegmentIndexForDate(segments, exac.endDate)
              }
            } else {
              eEnd = segments.length - 1
            }
            if (eEnd === undefined || eEnd < eStart) return null
            return { startIndex: eStart, endIndex: eEnd, label: exac.label }
          })
          .filter(Boolean) as { startIndex: number; endIndex: number; label?: string }[]

        const markers = period.addressedEncounterIds
          .map((id) => encounterToSegmentIndex.get(id))
          .filter((idx): idx is number => idx !== undefined)

        return {
          period,
          startIndex,
          endIndex,
          startsBeforeVisible,
          endsAfterVisible,
          isOngoing,
          exacerbationBars,
          markers,
        } as MappedPeriod
      })
      .filter(Boolean) as MappedPeriod[]
  }, [periods, encounterToSegmentIndex, segments.length, visibleDateRange])

  const cellStates = useMemo(() => {
    const cells: CellState[] = segments.map((seg) => ({
      type: 'empty' as const,
      bar: undefined,
      isGap: seg.type === 'gap',
    }))

    mappedPeriods.forEach((mp) => {
      const { startIndex, endIndex } = mp
      for (let i = startIndex; i <= endIndex; i++) {
        const isStart = i === startIndex
        const isEnd = i === endIndex
        cells[i] = {
          type: isStart && isEnd ? 'bar-only' : isStart ? 'bar-start' : isEnd ? 'bar-end' : 'bar-middle',
          bar: mp,
          isGap: segments[i].type === 'gap',
        }
      }
    })

    return cells
  }, [mappedPeriods, segments])

  const handlePressStart = (e: React.MouseEvent, period: DiagnosisPeriod) => {
    e.preventDefault()
    e.stopPropagation()
    const rect = e.currentTarget.getBoundingClientRect()
    const tooltipWidth = 300
    const centerX = rect.left + rect.width / 2
    const tooFarLeft = centerX - tooltipWidth / 2 < 10

    setTooltipState(
      tooFarLeft
        ? { isVisible: true, period, x: rect.right, y: rect.top + rect.height / 2, position: 'right' }
        : { isVisible: true, period, x: centerX, y: rect.top, position: 'top' }
    )
  }

  const handlePressEnd = () => {
    setTooltipState({ isVisible: false, x: 0, y: 0 })
  }

  return (
    <div className={`diagnosis-row ${isRowHighlighted ? 'row-highlighted' : ''}`}>
      {cellStates.map((cell, i) => {
        const seg = segments[i]
        const isHighlighted = contextHighlightSegmentId === seg.id

        if (cell.type === 'empty') {
          return (
            <div
              key={seg.id}
              className={`diagnosis-cell ${cell.isGap ? 'gap-cell' : ''} ${isHighlighted ? 'context-highlighted' : ''}`}
              onMouseEnter={() => onContextHighlight?.(seg.id)}
              onMouseLeave={() => onContextHighlight?.(undefined)}
            />
          )
        }

        const mp = cell.bar!
        const isBarStart = cell.type === 'bar-start' || cell.type === 'bar-only'
        const isBarEnd = cell.type === 'bar-end' || cell.type === 'bar-only'
        const markersHere = mp.markers.filter((m) => m === i)
        const isStartMarker = i === mp.startIndex && !mp.startsBeforeVisible
        const hasExacerbation = mp.exacerbationBars.some(
          (eb) => i >= eb.startIndex && i <= eb.endIndex
        )
        const hasMarker = markersHere.length > 0

        return (
          <div
            key={seg.id}
            className={`diagnosis-cell with-bar ${cell.isGap ? 'gap-cell' : ''} ${hasMarker ? 'has-marker' : ''} ${isHighlighted ? 'context-highlighted' : ''}`}
            onMouseDown={hasMarker ? (e) => handlePressStart(e, mp.period) : undefined}
            onMouseUp={hasMarker ? handlePressEnd : undefined}
            onMouseLeave={() => {
              if (hasMarker) handlePressEnd()
              onContextHighlight?.(undefined)
            }}
            onMouseEnter={() => onContextHighlight?.(seg.id)}
          >
            <div
              className={`diagnosis-bar-segment 
                ${isBarStart ? 'bar-start' : ''} 
                ${isBarEnd ? 'bar-end' : ''} 
                ${mp.isOngoing && isBarEnd ? 'ongoing' : ''} 
                ${!mp.isOngoing && isBarEnd ? 'resolved' : ''}
                ${mp.startsBeforeVisible && isBarStart ? 'starts-before' : ''}
                ${hasExacerbation ? 'has-exacerbation' : ''}`}
            >
              {markersHere.map((_, mi) => (
                <div key={mi} className={`encounter-marker ${isStartMarker ? 'start-marker' : ''}`} />
              ))}
            </div>
          </div>
        )
      })}

      {tooltipState.isVisible && tooltipState.period && (
        <Tooltip
          type="diagnosis"
          diagnosisPeriod={tooltipState.period}
          x={tooltipState.x}
          y={tooltipState.y}
          position={tooltipState.position}
        />
      )}
    </div>
  )
}

export default DiagnosisTrack
