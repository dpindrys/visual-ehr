import { createPortal } from 'react-dom'
import {
  Segment, Encounter, RangeConfig, DiagnosisPeriod,
  MedicationPeriod, PatientReportedEntry, TooltipPosition,
} from '../utils/types'
import { ValueStatus, STATUS_LABELS, getVitalNarrative, getLabNarrative } from '../utils/referenceRanges'
import { getTherapeuticDoseRange } from '../utils/continuousStateEngine'
import { formatDateDDMonYYYY, formatDateMonDayYear, formatDateMonDayYearSpaced } from '../utils/helpers'
import { ProBucket, ProSeverity } from '../utils/proBuckets'

// ============================================
// Range Bar (used in vitals/labs tooltip)
// ============================================

const RangeBar = ({ status }: { status: ValueStatus }) => {
  const segments = [
    { start: 0, end: 20, status: 'critical-low' },
    { start: 20, end: 40, status: 'low' },
    { start: 40, end: 60, status: 'normal' },
    { start: 60, end: 80, status: 'elevated' },
    { start: 80, end: 100, status: 'high' },
  ]

  const getIndicatorPosition = (s: ValueStatus): number => {
    switch (s) {
      case 'critical-low': return 10
      case 'low': case 'depressed': return 30
      case 'normal': return 50
      case 'elevated': return 70
      case 'high': case 'critical-high': return 90
      default: return 50
    }
  }

  const getIndicatorColor = (s: ValueStatus): string => {
    switch (s) {
      case 'critical-low': return 'var(--status-critical-low-bg)'
      case 'low': return 'var(--status-low-bg)'
      case 'depressed': return 'var(--status-depressed-bg)'
      case 'normal': return 'var(--status-normal-bg)'
      case 'elevated': return 'var(--status-elevated-bg)'
      case 'high': return 'var(--status-high-bg)'
      case 'critical-high': return 'var(--status-critical-high-bg)'
      default: return 'var(--status-normal-bg)'
    }
  }

  const position = getIndicatorPosition(status)

  return (
    <div className="range-bar">
      {segments.map((seg, i) => (
        <div
          key={i}
          className={`range-bar-segment range-bar-${seg.status}`}
          style={{ left: `${seg.start}%`, width: `${seg.end - seg.start}%` }}
        />
      ))}
      <div
        className="range-bar-indicator"
        style={{ left: `${position}%`, borderColor: getIndicatorColor(status) }}
      />
    </div>
  )
}

// ============================================
// Vitals/Labs Tooltip
// ============================================

interface VitalsLabsTooltipProps {
  status: ValueStatus
  value: number
  value2?: number
  date: string
  config: RangeConfig
  trackName: string
  subtypeName: string
}

function getMetricDisplayName(subtypeName: string, config: RangeConfig): string {
  switch (subtypeName) {
    case 'bp': return 'Blood Pressure'
    case 'hr': return 'Heart Rate'
    case 'spo2': return 'Oxygen Saturation'
    case 'temp_c': return 'Temperature'
    case 'a1c_pct': return 'HbA1c'
    case 'glucose_mg_dl': return 'Glucose'
    case 'ldl_mg_dl': return 'LDL Cholesterol'
    case 'triglycerides_mg_dl': return 'Triglycerides'
    case 'creatinine_mg_dl': return 'Creatinine'
    case 'bun_mg_dl': return 'BUN'
    case 'efgr_ml_min': return 'eGFR'
    case 'tsh_miu_l': return 'TSH'
    case 'sodium_meq_l': return 'Sodium'
    case 'potassium_meq_l': return 'Potassium'
    default: return config.label
  }
}

function formatMetricValue(subtypeName: string, value: number, value2: number | undefined, unit: string): string {
  if (subtypeName === 'bp') return `${value} / ${value2 ?? '—'} mmHg`
  if (subtypeName === 'temp_c') return `${value} °C`
  if (subtypeName === 'spo2') return `${value}%`
  return `${value} ${unit}`
}

function formatTooltipDate(dateStr: string): string {
  const d = new Date(dateStr)
  const day = d.getDate()
  const month = d.toLocaleDateString('en-US', { month: 'short' })
  const year = d.getFullYear()
  return `${day} ${month} ${year}`
}

const VitalsLabsTooltip = ({ status, value, value2, date, config, trackName, subtypeName }: VitalsLabsTooltipProps) => {
  const metricName = getMetricDisplayName(subtypeName, config)
  const valueStr = formatMetricValue(subtypeName, value, value2, config.unit)
  const narrative = trackName === 'vitals'
    ? getVitalNarrative(subtypeName, status)
    : getLabNarrative(subtypeName, status)

  return (
    <div className="tooltip tooltip-vitals-labs">
      <div className="tooltip-metric-header">
        <span className="tooltip-metric-name">{metricName}</span>
        <span className="tooltip-metric-date">{formatTooltipDate(date)}</span>
      </div>
      <div className="tooltip-metric-value-row">
        <span className="tooltip-metric-value">{valueStr}</span>
      </div>
      <RangeBar status={status} />
      <div className="tooltip-narrative">{narrative}</div>
      <div className="tooltip-arrow" />
    </div>
  )
}

// ============================================
// Gap Tooltip
// ============================================

const GapTooltip = ({ segment }: { segment: Segment }) => {
  const days = segment.durationDays || 0
  const startLabel = segment.startDate ? formatDateMonDayYearSpaced(segment.startDate) : ''
  const endLabel = segment.endDate ? formatDateMonDayYearSpaced(segment.endDate) : ''

  return (
    <div className="tooltip tooltip-gap">
      <div className="tooltip-gap-title">{days} days between visits</div>
      <div className="tooltip-gap-dates">{startLabel} to {endLabel}</div>
      <div className="tooltip-gap-message">No clinical data exists for this interval.</div>
      <div className="tooltip-arrow" />
    </div>
  )
}

// ============================================
// Encounter Tooltip
// ============================================

const EncounterTooltip = ({ encounter }: { encounter: Encounter }) => {
  const getTitle = (): string => {
    const setting = encounter.setting?.toLowerCase() || ''
    const type = encounter.type || 'Visit'
    if (setting.includes('primary')) return 'Primary Care Visit'
    if (setting.includes('urgent')) return 'Urgent Care Visit'
    if (setting.includes('emergency') || setting === 'ed') return 'Emergency Department Visit'
    if (setting.includes('hospital')) return 'Hospital Visit'
    if (setting.includes('telehealth') || setting.includes('virtual')) return 'Telehealth Visit'
    if (encounter.setting?.toLowerCase() === type.toLowerCase()) return `${encounter.setting} Visit`
    return `${encounter.setting || ''} ${type}`.trim() || 'Clinical Visit'
  }

  const addressedDiagnoses = encounter.diagnosesEvents?.filter(
    (d) => d.action === 'addressed' || d.action === 'start' || d.action === 'exacerbation'
  ) || []

  return (
    <div className="tooltip tooltip-encounter">
      <div className="tooltip-encounter-header">
        <span className="tooltip-encounter-type">{getTitle()}</span>
        <span className="tooltip-encounter-date">{formatTooltipDate(encounter.date)}</span>
      </div>
      <div className="tooltip-encounter-body">
        {encounter.location && (
          <div className="tooltip-encounter-row">
            <span className="tooltip-encounter-label">Care setting</span>
            <span className="tooltip-encounter-value">{encounter.location}</span>
          </div>
        )}
        {encounter.type && (
          <div className="tooltip-encounter-row">
            <span className="tooltip-encounter-label">Visit type</span>
            <span className="tooltip-encounter-value">{encounter.type}</span>
          </div>
        )}
        {addressedDiagnoses.length > 0 && (
          <div className="tooltip-encounter-row tooltip-encounter-diagnoses-row">
            <span className="tooltip-encounter-label">Diagnoses addressed</span>
            <span className="tooltip-encounter-value">
              {addressedDiagnoses.map((d, i) => (
                <span key={i}>{d.label}{i < addressedDiagnoses.length - 1 ? ', ' : ''}</span>
              ))}
            </span>
          </div>
        )}
      </div>
      <div className="tooltip-arrow" />
    </div>
  )
}

// ============================================
// Diagnosis Tooltip
// ============================================

const DiagnosisTooltip = ({ period }: { period: DiagnosisPeriod }) => {
  const getDuration = (): string => {
    const start = new Date(period.startDate)
    const end = period.endDate ? new Date(period.endDate) : new Date()
    const diffMs = end.getTime() - start.getTime()
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    if (days < 30) return `${days} day${days !== 1 ? 's' : ''}`
    if (days < 365) {
      const months = Math.floor(days / 30)
      return `${months} month${months !== 1 ? 's' : ''}`
    }
    const years = Math.floor(days / 365)
    const remainingMonths = Math.floor((days % 365) / 30)
    return remainingMonths > 0
      ? `${years} year${years !== 1 ? 's' : ''}, ${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`
      : `${years} year${years !== 1 ? 's' : ''}`
  }

  const statusInfo = period.exacerbations.find((e) => !e.endDate)
    ? { label: 'In Exacerbation', className: 'status-exacerbation' }
    : period.endDate
      ? { label: 'Resolved', className: 'status-resolved' }
      : { label: 'Active', className: 'status-active' }

  const duration = getDuration()
  const visitCount = period.addressedEncounterIds.length

  return (
    <div className="tooltip tooltip-diagnosis">
      <div className="tooltip-diagnosis-header">
        <div className="tooltip-diagnosis-name">{period.label}</div>
        <span className="tooltip-diagnosis-date">{formatTooltipDate(period.startDate)}</span>
      </div>
      <div className="tooltip-diagnosis-subtitle-row">
        <span className="tooltip-diagnosis-code">ICD-10: {period.code}</span>
        <span className={`tooltip-diagnosis-status ${statusInfo.className}`}>{statusInfo.label}</span>
      </div>
      <div className="tooltip-diagnosis-details">
        <div className="tooltip-diagnosis-row">
          <span className="tooltip-diagnosis-label">Duration:</span>
          <span className="tooltip-diagnosis-value">{duration}</span>
        </div>
        <div className="tooltip-diagnosis-row">
          <span className="tooltip-diagnosis-label">Onset:</span>
          <span className="tooltip-diagnosis-value">{formatDateMonDayYear(period.startDate)}</span>
        </div>
        {period.endDate && (
          <div className="tooltip-diagnosis-row">
            <span className="tooltip-diagnosis-label">Resolved:</span>
            <span className="tooltip-diagnosis-value">{formatDateMonDayYear(period.endDate)}</span>
          </div>
        )}
        <div className="tooltip-diagnosis-row">
          <span className="tooltip-diagnosis-label">Visits addressed:</span>
          <span className="tooltip-diagnosis-value">{visitCount} encounter{visitCount !== 1 ? 's' : ''}</span>
        </div>
      </div>
      {period.exacerbations.length > 0 && (
        <div className="tooltip-diagnosis-exacerbations">
          <div className="tooltip-diagnosis-exac-header">Exacerbations ({period.exacerbations.length})</div>
          {period.exacerbations.map((exac, i) => (
            <div key={i} className="tooltip-diagnosis-exac-item">
              <span className="exac-dates">
                {formatDateMonDayYear(exac.startDate)}
                {exac.endDate ? ` - ${formatDateMonDayYear(exac.endDate)}` : ' - ongoing'}
              </span>
              {exac.label && <span className="exac-label">{exac.label}</span>}
            </div>
          ))}
        </div>
      )}
      <div className="tooltip-arrow" />
    </div>
  )
}

// ============================================
// Reference Range Tooltip
// ============================================

const ReferenceTooltip = ({ config, trackName }: { config: RangeConfig; trackName: string }) => {
  const fmt = (val: number | undefined, unit: string) =>
    val === undefined ? '—' : `${val} ${unit}`

  return (
    <div className="tooltip tooltip-reference">
      <div className="tooltip-reference-header">
        <div className="tooltip-reference-name">{config.label}</div>
        <div className="tooltip-reference-type">{trackName === 'vitals' ? 'Vital Sign' : 'Lab Value'}</div>
      </div>
      <div className="tooltip-reference-unit">Unit: {config.unit}</div>
      <div className="tooltip-reference-ranges">
        <div className="tooltip-reference-section">
          <div className="tooltip-reference-section-title normal">Normal Range</div>
          <div className="tooltip-reference-range-value">
            {fmt(config.normalLow, '')} — {fmt(config.normalHigh, config.unit)}
          </div>
        </div>
        {(config.low !== undefined || config.criticalLow !== undefined) && (
          <div className="tooltip-reference-section">
            <div className="tooltip-reference-section-title low">Low Thresholds</div>
            {config.low !== undefined && (
              <div className="tooltip-reference-range-row">
                <span>Low:</span>
                <span>&lt; {fmt(config.low, config.unit)}</span>
              </div>
            )}
            {config.criticalLow !== undefined && (
              <div className="tooltip-reference-range-row critical">
                <span>Critical Low:</span>
                <span>&lt; {fmt(config.criticalLow, config.unit)}</span>
              </div>
            )}
          </div>
        )}
        {(config.elevated !== undefined || config.high !== undefined || config.criticalHigh !== undefined) && (
          <div className="tooltip-reference-section">
            <div className="tooltip-reference-section-title high">High Thresholds</div>
            {config.elevated !== undefined && (
              <div className="tooltip-reference-range-row">
                <span>Elevated:</span>
                <span>&gt; {fmt(config.elevated, config.unit)}</span>
              </div>
            )}
            {config.high !== undefined && (
              <div className="tooltip-reference-range-row">
                <span>High:</span>
                <span>&gt; {fmt(config.high, config.unit)}</span>
              </div>
            )}
            {config.criticalHigh !== undefined && (
              <div className="tooltip-reference-range-row critical">
                <span>Critical High:</span>
                <span>&gt; {fmt(config.criticalHigh, config.unit)}</span>
              </div>
            )}
          </div>
        )}
      </div>
      <div className="tooltip-arrow" />
    </div>
  )
}

// ============================================
// Medication Tooltip
// ============================================

const MedicationTooltip = ({ period }: { period: MedicationPeriod }) => {
  const statusInfo = period.endDate
    ? { label: 'Stopped', className: 'status-stopped' }
    : { label: 'Active', className: 'status-active' }

  const lastDose = period.doseSegments.length > 0
    ? period.doseSegments[period.doseSegments.length - 1]
    : null

  const currentDose = lastDose ? lastDose.dose : '—'
  const routeFreq = lastDose?.route && lastDose?.frequency
    ? `${lastDose.route}, ${lastDose.frequency}`
    : null
  const therapeuticRange = getTherapeuticDoseRange(period.name) || '—'

  return (
    <div className="tooltip tooltip-medication">
      <div className="tooltip-medication-header">
        <div className="tooltip-medication-name">{period.name}</div>
        <span className="tooltip-medication-date">{formatTooltipDate(period.startDate)}</span>
      </div>
      <div className="tooltip-medication-subtitle-row">
        <span className="tooltip-medication-dose-line">Current dose: {currentDose}{routeFreq ? ` (${routeFreq})` : ''}</span>
        <span className={`tooltip-medication-status ${statusInfo.className}`}>{statusInfo.label}</span>
      </div>
      <div className="tooltip-medication-details">
        <div className="tooltip-medication-row">
          <span className="tooltip-medication-label">Started:</span>
          <span className="tooltip-medication-value">{formatDateMonDayYear(period.startDate)}</span>
        </div>
        <div className="tooltip-medication-row">
          <span className="tooltip-medication-label">Therapeutic dose:</span>
          <span className="tooltip-medication-value">{therapeuticRange}</span>
        </div>
        {period.indication != null && period.indication !== '' && (
          <div className="tooltip-medication-row">
            <span className="tooltip-medication-label">Indication:</span>
            <span className="tooltip-medication-value">{period.indication}</span>
          </div>
        )}
        {period.endDate && (
          <div className="tooltip-medication-row">
            <span className="tooltip-medication-label">Stopped:</span>
            <span className="tooltip-medication-value">{formatDateMonDayYear(period.endDate)}</span>
          </div>
        )}
      </div>
      <div className="tooltip-arrow" />
    </div>
  )
}

// ============================================
// Patient Reported Tooltip
// ============================================

const PatientReportedTooltip = ({ entries }: { entries: PatientReportedEntry[] }) => (
  <div className="tooltip tooltip-patient-reported">
    {entries.map((entry, i) => {
      const source = entry.source === 'encounter' ? 'Clinic Visit' : 'Patient App'
      const scores = [
        { label: 'Fatigue', value: entry.fatigue },
        { label: 'Pain', value: entry.pain },
        { label: 'Functional limitation', value: entry.functional_limitation },
        { label: 'Distress', value: entry.distress },
      ]
      return (
        <div key={entry.date} className="tooltip-pro-entry">
          {i > 0 && <div className="tooltip-pro-divider" />}
          <div className="tooltip-pro-header">
            <div className="tooltip-pro-source">{source}</div>
            <div className="tooltip-pro-date">{formatDateDDMonYYYY(entry.date)}</div>
          </div>
          <div className="tooltip-pro-scores">
            {scores.map((s) => (
              <div key={s.label} className="tooltip-pro-score-row">
                <span className="tooltip-pro-score-label">{s.label}</span>
                <span className="tooltip-pro-score-value">{s.value}/10</span>
              </div>
            ))}
          </div>
          {entry.narrative && (
            <div className="tooltip-pro-narrative">&ldquo;{entry.narrative}&rdquo;</div>
          )}
        </div>
      )
    })}
    <div className="tooltip-arrow" />
  </div>
)

// ============================================
// Sidebar PRO Tooltip
// ============================================

const SidebarProTooltip = ({ subtypeName, entries }: { subtypeName: string; entries: PatientReportedEntry[] }) => {
  const formatMonYear = (dateStr: string): string => {
    const d = new Date(dateStr)
    const month = d.toLocaleDateString('en-US', { month: 'short' })
    const year = d.getFullYear()
    return `${month} ${year}`
  }

  const displayName = subtypeName.charAt(0).toUpperCase() + subtypeName.slice(1).replace(/_/g, ' ')
  const dataPoints = entries
    .map((e) => ({ date: e.date, value: e[subtypeName] as number }))
    .filter((p) => typeof p.value === 'number')
    .sort((a, b) => a.date.localeCompare(b.date))

  if (dataPoints.length === 0) {
    return (
      <div className="tooltip tooltip-sidebar-pro">
        <div className="tooltip-pro-sidebar-name">{displayName}</div>
        <div className="tooltip-pro-sidebar-empty">No data available</div>
        <div className="tooltip-arrow" />
      </div>
    )
  }

  const latest = dataPoints[dataPoints.length - 1]
  const peak = dataPoints.reduce((max, p) => p.value > max.value ? p : max, dataPoints[0])
  const first = dataPoints[0]

  const getSeverity = (val: number): string =>
    val <= 1 ? 'Minimal' : val <= 3 ? 'Mild' : val <= 6 ? 'Moderate' : 'Severe'

  let trend = ''
  if (dataPoints.length >= 2) {
    if (latest.value - peak.value === 0) {
      trend = 'Currently at peak level'
    } else {
      const improvement = peak.value - latest.value
      trend = improvement >= 4
        ? `Significantly improved from peak of ${peak.value}/10`
        : `Improving from peak of ${peak.value}/10`
    }
  }

  return (
    <div className="tooltip tooltip-sidebar-pro">
      <div className="tooltip-pro-sidebar-name">{displayName}</div>
      <div className="tooltip-pro-sidebar-current">
        <span className="tooltip-pro-sidebar-score">{latest.value}/10</span>
        <span className="tooltip-pro-sidebar-severity">{getSeverity(latest.value)}</span>
      </div>
      {trend && <div className="tooltip-pro-sidebar-trend">{trend}</div>}
      <div className="tooltip-pro-sidebar-details">
        <div className="tooltip-pro-sidebar-row">
          <span>Peak</span>
          <span>{peak.value}/10 ({formatMonYear(peak.date)})</span>
        </div>
        <div className="tooltip-pro-sidebar-row">
          <span>First reported</span>
          <span>{first.value}/10 ({formatMonYear(first.date)})</span>
        </div>
        <div className="tooltip-pro-sidebar-row">
          <span>Reports</span>
          <span>{dataPoints.length} since {formatMonYear(first.date)}</span>
        </div>
      </div>
      <div className="tooltip-arrow" />
    </div>
  )
}

// ============================================
// Medication Cell Tooltip
// ============================================

const DOSE_STATE_LABELS: Record<'below' | 'at' | 'above', string> = {
  below: 'Below typical dose range.',
  at: 'Within typical dose range.',
  above: 'Above typical dose range.',
}

interface MedicationCellTooltipProps {
  period: MedicationPeriod
  doseSegment: import('../utils/types').DoseSegment
}

const MedicationCellTooltip = ({ period, doseSegment }: MedicationCellTooltipProps) => {
  const doseStateLabel = DOSE_STATE_LABELS[doseSegment.therapeuticLevel]
  const statusInfo = period.endDate
    ? null
    : { label: 'Active', className: 'status-active' }

  const doseLine = [
    doseSegment.dose,
    doseSegment.route,
    doseSegment.frequency,
  ].filter(Boolean).join(' · ')

  return (
    <div className="tooltip tooltip-medication-cell">
      <div className="tooltip-medication-cell-header">
        <span className="tooltip-medication-cell-name">{period.name}</span>
        <span className="tooltip-medication-cell-date">{formatTooltipDate(doseSegment.startDate)}</span>
      </div>
      {doseLine && (
        <div className="tooltip-medication-cell-subtitle-row">
          <span className="tooltip-medication-cell-dose">{doseLine}</span>
          {statusInfo && (
            <span className={`tooltip-medication-cell-status ${statusInfo.className}`}>{statusInfo.label}</span>
          )}
        </div>
      )}
      {!doseLine && statusInfo && (
        <div className="tooltip-medication-cell-subtitle-row">
          <span />
          <span className={`tooltip-medication-cell-status ${statusInfo.className}`}>{statusInfo.label}</span>
        </div>
      )}
      <div className="tooltip-medication-cell-details">
        <div className="tooltip-medication-cell-row">
          <span className="tooltip-medication-cell-label">Dose state</span>
          <span className="tooltip-medication-cell-value">{doseStateLabel}</span>
        </div>
        <div className="tooltip-medication-cell-row">
          <span className="tooltip-medication-cell-label">Since</span>
          <span className="tooltip-medication-cell-value">{formatDateMonDayYear(doseSegment.startDate)}</span>
        </div>
        {period.indication && (
          <div className="tooltip-medication-cell-row">
            <span className="tooltip-medication-cell-label">Indication</span>
            <span className="tooltip-medication-cell-value">{period.indication}</span>
          </div>
        )}
        {period.endDate && (
          <div className="tooltip-medication-cell-row">
            <span className="tooltip-medication-cell-label">Stopped</span>
            <span className="tooltip-medication-cell-value">{formatDateMonDayYear(period.endDate)}</span>
          </div>
        )}
      </div>
      <div className="tooltip-arrow" />
    </div>
  )
}

// ============================================
// PRO Cell — Encounter Tooltip
// ============================================

const PRO_SEVERITY_LABELS: Record<ProSeverity, string> = {
  'low': 'Low',
  'moderate': 'Moderate',
  'high': 'High',
  'very-high': 'Very High',
}

const PRO_SUBTYPE_LABELS: Record<string, string> = {
  fatigue: 'Fatigue',
  pain: 'Pain',
  functional_limitation: 'Functional Limitation',
  distress: 'Distress',
}

interface EncounterProTooltipProps {
  subtype: string
  bucket: ProBucket
  encounter: Encounter
}

const EncounterProTooltip = ({ subtype, bucket, encounter }: EncounterProTooltipProps) => {
  const title = PRO_SUBTYPE_LABELS[subtype] || subtype
  const severityLabel = PRO_SEVERITY_LABELS[bucket.severity]

  const getEncounterContext = (): string => {
    const s = encounter.setting?.toLowerCase() || ''
    if (s.includes('primary') || s.includes('pcp')) return 'Primary Care'
    if (s.includes('urgent')) return 'Urgent Care'
    if (s.includes('emergency') || s === 'ed') return 'Emergency Dept.'
    if (s.includes('telehealth') || s.includes('virtual')) return 'Telehealth'
    if (s.includes('specialist')) return 'Specialist'
    return encounter.setting || 'Clinical Visit'
  }

  const entry = bucket.observations[0]
  const narrative = entry
    ? (() => {
        const proEntryNarrative = (entry as unknown as { narrative?: string }).narrative
        return proEntryNarrative
      })()
    : undefined

  return (
    <div className="tooltip tooltip-pro-cell">
      <div className="tooltip-pro-cell-header">
        <span className="tooltip-pro-cell-title">{title}</span>
        <span className="tooltip-pro-cell-date">{formatTooltipDate(encounter.date)}</span>
      </div>
      <div className="tooltip-pro-cell-score-row">
        <span className="tooltip-pro-cell-score">{bucket.worstScore}<span className="tooltip-pro-cell-score-denom">/10</span></span>
        <span className={`tooltip-pro-cell-severity tooltip-pro-severity-${bucket.severity}`}>{severityLabel}</span>
      </div>
      <div className="tooltip-pro-cell-context">{getEncounterContext()}</div>
      {narrative && (
        <div className="tooltip-pro-cell-narrative">&ldquo;{narrative}&rdquo;</div>
      )}
      <div className="tooltip-arrow" />
    </div>
  )
}

// ============================================
// PRO Cell — Gap Tooltip
// ============================================

interface GapProTooltipProps {
  subtype: string
  bucket: ProBucket
  segment: Segment
}

const TRAJECTORY_LABELS: Record<string, string> = {
  rising: 'Rising',
  falling: 'Falling',
  peak: 'Peak mid-interval',
  valley: 'Valley mid-interval',
  mixed: 'Mixed / Volatile',
  stable: 'Stable',
}

const GapProTooltip = ({ subtype, bucket, segment }: GapProTooltipProps) => {
  const title = PRO_SUBTYPE_LABELS[subtype] || subtype
  const severityLabel = PRO_SEVERITY_LABELS[bucket.severity]
  const startLabel = segment.startDate ? formatDateMonDayYearSpaced(segment.startDate) : ''
  const endLabel = segment.endDate ? formatDateMonDayYearSpaced(segment.endDate) : ''

  const avg = bucket.observations.length > 0
    ? Math.round((bucket.observations.reduce((s, o) => s + o.score, 0) / bucket.observations.length) * 10) / 10
    : 0
  const latestScore = bucket.observations[bucket.observations.length - 1]?.score

  const dateRangeLabel = startLabel && endLabel ? `${startLabel} → ${endLabel}` : startLabel || endLabel || ''

  return (
    <div className="tooltip tooltip-pro-cell tooltip-pro-cell-gap">
      <div className="tooltip-pro-cell-header">
        <span className="tooltip-pro-cell-title">{title}</span>
        {dateRangeLabel && <span className="tooltip-pro-cell-date">{dateRangeLabel}</span>}
      </div>
      <div className="tooltip-pro-cell-score-row">
        <span className="tooltip-pro-cell-score">{bucket.worstScore}<span className="tooltip-pro-cell-score-denom">/10</span></span>
        <span className={`tooltip-pro-cell-severity tooltip-pro-severity-${bucket.severity}`}>{severityLabel}</span>
      </div>
      <div className="tooltip-pro-cell-stats">
        <div className="tooltip-pro-cell-stat-row">
          <span className="tooltip-pro-cell-stat-label">Observations</span>
          <span className="tooltip-pro-cell-stat-value">{bucket.count}</span>
        </div>
        <div className="tooltip-pro-cell-stat-row">
          <span className="tooltip-pro-cell-stat-label">Worst score</span>
          <span className="tooltip-pro-cell-stat-value">{bucket.worstScore}/10</span>
        </div>
        {latestScore !== undefined && (
          <div className="tooltip-pro-cell-stat-row">
            <span className="tooltip-pro-cell-stat-label">Latest score</span>
            <span className="tooltip-pro-cell-stat-value">{latestScore}/10</span>
          </div>
        )}
        <div className="tooltip-pro-cell-stat-row">
          <span className="tooltip-pro-cell-stat-label">Average score</span>
          <span className="tooltip-pro-cell-stat-value">{avg}/10</span>
        </div>
        {bucket.trajectory && (
          <div className="tooltip-pro-cell-stat-row">
            <span className="tooltip-pro-cell-stat-label">Trajectory</span>
            <span className="tooltip-pro-cell-stat-value">{TRAJECTORY_LABELS[bucket.trajectory] || bucket.trajectory}</span>
          </div>
        )}
      </div>
      {bucket.observations.length > 1 && (
        <div className="tooltip-pro-cell-obs-list">
          <div className="tooltip-pro-cell-obs-header">Reports</div>
          {bucket.observations.map((obs, i) => (
            <div key={i} className="tooltip-pro-cell-obs-row">
              <span className="tooltip-pro-cell-obs-date">{formatDateMonDayYear(obs.date)}</span>
              <span className="tooltip-pro-cell-obs-score">{obs.score}/10</span>
            </div>
          ))}
        </div>
      )}
      <div className="tooltip-arrow" />
    </div>
  )
}

// ============================================
// Tooltip Dispatcher
// ============================================

export interface TooltipProps {
  type: string
  x: number
  y: number
  position?: TooltipPosition

  // vitals-labs
  status?: ValueStatus
  value?: number
  value2?: number
  date?: string
  config?: RangeConfig
  trackName?: string
  subtypeName?: string

  // gap
  segment?: Segment

  // encounter
  encounter?: Encounter

  // diagnosis
  diagnosisPeriod?: DiagnosisPeriod
  diagnosisPeriods?: DiagnosisPeriod[]

  // medication
  medicationPeriods?: MedicationPeriod[]

  // patient-reported
  patientReportedEntries?: PatientReportedEntry[]

  // pro-cell
  proBucket?: ProBucket
  proSubtype?: string

  // medication-cell
  medicationPeriod?: MedicationPeriod
  doseSegment?: import('../utils/types').DoseSegment
}

const Tooltip = (props: TooltipProps) => {
  const { type, x, y, position = 'top' } = props
  const tooltipWidth = 300
  const offset = 12

  let style: React.CSSProperties
  let containerClass = 'tooltip-container'

  if (position === 'left') {
    style = { right: 200 + offset, top: y, transform: 'translateY(-50%)' }
    containerClass = 'tooltip-container tooltip-left'
  } else if (position === 'right') {
    style = { left: x, top: y, transform: 'translateY(-50%)' }
    containerClass = 'tooltip-container tooltip-right'
  } else {
    let left = x - tooltipWidth / 2
    const minLeft = 10
    const maxLeft = window.innerWidth - tooltipWidth - 10
    left = Math.max(minLeft, Math.min(left, maxLeft))
    style = { left, top: y - offset, transform: 'translateY(-100%)' }
  }

  let content: React.ReactNode = null

  if (type === 'vitals-labs' && props.status && props.value !== undefined && props.date && props.config && props.trackName && props.subtypeName) {
    content = (
      <VitalsLabsTooltip
        status={props.status}
        value={props.value}
        value2={props.value2}
        date={props.date}
        config={props.config}
        trackName={props.trackName}
        subtypeName={props.subtypeName}
      />
    )
  } else if (type === 'gap' && props.segment) {
    content = <GapTooltip segment={props.segment} />
  } else if (type === 'encounter' && props.encounter) {
    content = <EncounterTooltip encounter={props.encounter} />
  } else if (type === 'diagnosis' && props.diagnosisPeriod) {
    content = <DiagnosisTooltip period={props.diagnosisPeriod} />
  } else if (type === 'reference' && props.config && props.trackName) {
    content = <ReferenceTooltip config={props.config} trackName={props.trackName} />
  } else if (type === 'sidebar-diagnosis' && props.diagnosisPeriods && props.diagnosisPeriods.length > 0) {
    content = <DiagnosisTooltip period={props.diagnosisPeriods[0]} />
  } else if (type === 'sidebar-medication' && props.medicationPeriods && props.medicationPeriods.length > 0) {
    content = <MedicationTooltip period={props.medicationPeriods[0]} />
  } else if (type === 'patient-reported' && props.patientReportedEntries && props.patientReportedEntries.length > 0) {
    content = <PatientReportedTooltip entries={props.patientReportedEntries} />
  } else if (type === 'sidebar-pro' && props.patientReportedEntries && props.subtypeName) {
    content = <SidebarProTooltip subtypeName={props.subtypeName} entries={props.patientReportedEntries} />
  } else if (type === 'medication-cell' && props.medicationPeriod && props.doseSegment) {
    content = <MedicationCellTooltip period={props.medicationPeriod} doseSegment={props.doseSegment} />
  } else if (type === 'pro-cell-encounter' && props.proBucket && props.proSubtype && props.encounter) {
    content = <EncounterProTooltip subtype={props.proSubtype} bucket={props.proBucket} encounter={props.encounter} />
  } else if (type === 'pro-cell-gap' && props.proBucket && props.proSubtype && props.segment) {
    content = <GapProTooltip subtype={props.proSubtype} bucket={props.proBucket} segment={props.segment} />
  }

  if (!content) return null

  return createPortal(
    <div className={containerClass} style={style}>{content}</div>,
    document.body
  )
}

export default Tooltip
