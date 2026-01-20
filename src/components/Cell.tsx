import { useState, useRef, useEffect } from 'react'
import { PatientData, Segment, Encounter, PeekCardState } from '../utils/types'
import { computeActiveDiagnosesBySegment, computeActiveMedicationsBySegment } from '../utils/continuousStateEngine'
import { getVitalStatus, getLabStatus, ValueStatus } from '../utils/referenceRanges'

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

    // Gaps: no clinical data exists, show "—" for all domains
    if (segment.type === 'gap') {
      return { value: '—' };
    }

    // Continuous domains: use fill-forward state engine
    if (trackConfig?.type === 'continuous') {
      if (trackName === 'diagnoses') {
        // Individual diagnosis subtypes - check if this specific diagnosis is active
        const diagnosesBySegment = computeActiveDiagnosesBySegment(patientData, segments);
        const active = diagnosesBySegment[segment.id] || [];
        
        // Map subtype names to diagnosis labels/codes
        const diagnosisMap: Record<string, string[]> = {
          type_2_diabetes: ['diabetes', 'e11'],
          asthma: ['asthma', 'j45'],
          anemia: ['anemia', 'd64'],
          hypertension: ['hypertension', 'i10'],
          hypothyroidism: ['hypothyroidism', 'e03'],
        };
        
        const matchTerms = diagnosisMap[subtypeName] || [subtypeName];
        const matchingDx = active.find(d => 
          matchTerms.some(term => 
            d.label.toLowerCase().includes(term) || 
            d.code.toLowerCase().includes(term)
          )
        );
        
        if (!matchingDx) return { value: '—' };
        return {
          value: '●', // Active indicator
          metadata: { diagnosis: matchingDx },
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
        const labs = encounter.labs as Record<string, number | undefined> | undefined;
        const labsMap: Record<string, { key: string; unit: string }> = {
          a1c_pct: { key: 'a1c_pct', unit: '%' },
          glucose_mg_dl: { key: 'glucose_mg_dl', unit: 'mg/dL' },
          ldl_mg_dl: { key: 'ldl_mg_dl', unit: 'mg/dL' },
          triglycerides_mg_dl: { key: 'triglycerides_mg_dl', unit: 'mg/dL' },
          creatinine_mg_dl: { key: 'creatinine_mg_dl', unit: 'mg/dL' },
          tsh_miu_l: { key: 'tsh_miu_l', unit: 'mIU/L' },
          bun_mg_dl: { key: 'bun_mg_dl', unit: 'mg/dL' },
          efgr_ml_min: { key: 'efgr_ml_min', unit: 'mL/min' },
          sodium_meq_l: { key: 'sodium_meq_l', unit: 'mEq/L' },
          potassium_meq_l: { key: 'potassium_meq_l', unit: 'mEq/L' },
          chloride_meq_l: { key: 'chloride_meq_l', unit: 'mEq/L' },
          co2_meq_l: { key: 'co2_meq_l', unit: 'mEq/L' },
          calcium_mg_dl: { key: 'calcium_mg_dl', unit: 'mg/dL' },
          protein_g_dl: { key: 'protein_g_dl', unit: 'g/dL' },
          albumin_g_dl: { key: 'albumin_g_dl', unit: 'g/dL' },
        };
        const labConfig = labsMap[subtypeName];
        if (labConfig && labs) {
          const value = labs[labConfig.key];
          if (value !== undefined) {
            return { value: `${value}${labConfig.unit}` };
          }
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

  // Calculate status for vitals/labs
  const getValueStatus = (): ValueStatus | null => {
    if (segment.type === 'gap' || !encounter) return null
    
    if (trackName === 'vitals') {
      const vitals = encounter.vitals
      if (!vitals) return null
      
      switch (subtypeName) {
        case 'hr':
          return vitals.hr ? getVitalStatus('hr', vitals.hr) : null
        case 'bp':
          return (vitals.bp_sys && vitals.bp_dia) 
            ? getVitalStatus('bp', vitals.bp_sys, vitals.bp_dia) 
            : null
        case 'spo2':
          return vitals.spo2 ? getVitalStatus('spo2', vitals.spo2) : null
        case 'temp_c':
          return vitals.temp_c ? getVitalStatus('temp_c', vitals.temp_c) : null
        default:
          return null
      }
    }
    
    if (trackName === 'labs') {
      const labs = encounter.labs as Record<string, number | undefined> | undefined
      if (!labs) return null
      
      const labValue = labs[subtypeName]
      if (labValue === undefined) return null
      
      return getLabStatus(subtypeName, labValue)
    }
    
    return null
  }

  const valueStatus = getValueStatus()

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
  const isEncounterCell = trackName === 'encounters'
  const statusClass = valueStatus ? `status-${valueStatus}` : ''

  return (
    <div
      ref={cellRef}
      className={`subtype-cell ${segment.type === 'gap' ? 'gap' : ''} ${isEmpty ? 'empty' : ''} ${
        isHighlighted ? 'context-highlighted' : ''
      } ${isPressHeld ? 'press-held' : ''} ${isEncounterCell ? 'encounter-cell' : ''} ${statusClass}`}
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
