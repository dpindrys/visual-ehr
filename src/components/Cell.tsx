import { useState, useRef, useEffect } from 'react'
import { PatientData, Segment, Encounter, PeekCardState } from '../utils/types'
import { computeActiveDiagnosesBySegment, computeActiveMedicationsBySegment } from '../utils/continuousStateEngine'

interface CellProps {
  segment: Segment
  encounter?: Encounter
  trackName: string
  subtypeName: string
  patientData: PatientData
  segments: Segment[]
  isHighlighted?: boolean
  onContextHighlight: (segmentId?: string) => void
  onPeekCard: (state: PeekCardState) => void
}

const Cell = ({
  segment,
  encounter,
  trackName,
  subtypeName,
  patientData,
  segments,
  isHighlighted,
  onContextHighlight,
  onPeekCard,
}: CellProps) => {
const [pressHoldTimer, setPressHoldTimer] =
  useState<ReturnType<typeof setTimeout> | null>(null)
  const [isPressHeld, setIsPressHeld] = useState(false)
  const cellRef = useRef<HTMLDivElement>(null)

  // Get cell value and metadata (now using fill-forward state engine for continuous domains)
  const getCellContent = (): { value: string; metadata?: Record<string, unknown> } => {
    const trackConfig = patientData.domainConfig.tracks[trackName];
    // Encounters row: render encounter/gap info as a domain row
    if (trackName === 'encounters') {
    if (segment.type === 'encounter' && encounter) {
        const displayLabel = formatSetting(encounter.setting) || encounter.type

        return {
        value: displayLabel,
        metadata: {
            date: encounter.date,
            type: encounter.type,
            setting: encounter.setting,
            location: encounter.location,
            address: encounter.address,
            reason: encounter.reason,
            notes: encounter.notes,
        },
        }
    } else if (segment.type === 'gap') {
        return {
        value: segment.label,
        metadata: {
            startDate: segment.startDate,
            endDate: segment.endDate,
            durationDays: segment.durationDays,
            message: 'No clinical data exists in this interval.',
        },
        }
    }
    return { value: '' }
    }

    // Continuous domains: use fill-forward state engine
    if (trackConfig?.type === 'continuous') {
      if (trackName === 'diagnoses') {
        // All diagnoses in one row (problem_list)
        const diagnosesBySegment = computeActiveDiagnosesBySegment(patientData, segments);
        const active = diagnosesBySegment[segment.id] || [];
        if (active.length === 0) return { value: '—' };
        // Show up to 2, then +N
        const labels = active.map(d => d.label.split(' ')[0]);
        let value = labels.slice(0, 2).join(', ');
        if (active.length > 2) value += ` +${active.length - 2}`;
        return {
          value,
          metadata: { diagnoses: active },
        };
      }
      if (trackName === 'medications') {
        const medsBySegment = computeActiveMedicationsBySegment(patientData, segments);
        const active = medsBySegment[segment.id] || [];
        // Find the one for this subtype (medication name)
        const med = active.find(m => m.name.toLowerCase() === subtypeName.toLowerCase());
        if (!med) return { value: '—' };
        return {
          value: med.dose,
          metadata: med,
        };
      }
    }
    // Point-in-time domains: only show value in encounter segments
    if (segment.type === 'encounter' && encounter) {
      if (trackName === 'vitals') {
        const vitalsMap: Record<string, string> = {
          hr: `${encounter.vitals?.hr ?? '—'} bpm`,
          bp: `${encounter.vitals?.bp_sys ?? '—'}/${encounter.vitals?.bp_dia ?? '—'}`,
          spo2: `${encounter.vitals?.spo2 ?? '—'}%`,
          temp_c: `${encounter.vitals?.temp_c ?? '—'}°C`,
        };
        return { value: vitalsMap[subtypeName] || '—' };
      }
      if (trackName === 'labs') {
        const labsMap: Record<string, { value: number | undefined; unit: string }> = {
          a1c_pct: { value: encounter.labs?.a1c_pct, unit: '%' },
          glucose_mg_dl: { value: encounter.labs?.glucose_mg_dl, unit: 'mg/dL' },
          ldl_mg_dl: { value: encounter.labs?.ldl_mg_dl, unit: 'mg/dL' },
          triglycerides_mg_dl: { value: encounter.labs?.triglycerides_mg_dl, unit: 'mg/dL' },
          creatinine_mg_dl: { value: encounter.labs?.creatinine_mg_dl, unit: 'mg/dL' },
        };
        const lab = labsMap[subtypeName];
        if (lab && lab.value !== undefined) {
          return { value: `${lab.value}${lab.unit}` };
        }
        return { value: '—' };
      }
    }
    // Otherwise, empty
    return { value: '—' };
  };

    const formatSetting = (setting?: string) => {
    if (!setting) return ''
    const s = setting.toLowerCase()
    if (s.includes('primary')) return 'PCP'
    if (s.includes('urgent')) return 'UC'
    if (s.includes('emergency') || s === 'ed') return 'ED'
    return setting
    }



  const { value, metadata } = getCellContent()

  // Press-and-hold logic
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    const timer = setTimeout(() => {
      setIsPressHeld(true)
      onContextHighlight(segment.id)

      if (cellRef.current) {
        const rect = cellRef.current.getBoundingClientRect()
        onPeekCard({
          isVisible: true,
          cellData: {
            segmentId: segment.id,
            subtypeId: subtypeName,
            trackName,
            values: value,
            metadata,
          },
          segment,
          x: rect.right + 10,
          y: rect.top,
        })
      }
    }, 500)

    setPressHoldTimer(timer)
  }

  const handleMouseUp = () => {
    if (pressHoldTimer) {
      clearTimeout(pressHoldTimer)
      setPressHoldTimer(null)
    }
    setIsPressHeld(false)
  }

  const handleMouseEnter = () => {
    if (!isPressHeld) {
      onContextHighlight(segment.id)
    }
  }

  const handleMouseLeave = () => {
    if (!isPressHeld) {
      onContextHighlight(undefined)
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pressHoldTimer) {
        clearTimeout(pressHoldTimer)
      }
    }
  }, [pressHoldTimer])

  const isEmpty = value === '—'

  return (
    <div
      ref={cellRef}
      className={`subtype-cell ${isEmpty ? 'empty' : ''} ${
        isHighlighted ? 'context-highlighted' : ''
      } ${isPressHeld ? 'press-held' : ''}`}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="subtype-cell-content">{value}</div>
    </div>
  )
}

export default Cell
