export type AllergyInfo = {
  name: string
  severity: 'severe' | 'moderate' | 'mild'
  reaction: string
}

export type CareTeamMember = {
  role: string
  name: string
}

export type PatientInfo = {
  id: string
  name: string
  dob: string
  sex: string
  mrn: string
  age?: number
  height?: string
  weight?: string
  bmi?: number
  phone?: string
  language?: string
  pharmacy?: string
  allergies?: AllergyInfo[]
  careTeam?: CareTeamMember[]
  summary: {
    allergies: string[]
    careTeam: string[]
    problemsAtAGlance: string[]
  }
}

export type PatientReportedEntry = {
  date: string
  source: 'encounter' | 'patient_app'
  fatigue?: number
  pain?: number
  functional_limitation?: number
  distress?: number
  narrative?: string
  [key: string]: string | number | undefined
}

export type PatientData = {
  patient: PatientInfo
  encounters: Encounter[]
  domainConfig: DomainConfig
  patientReported?: PatientReportedEntry[]
}

export type Encounter = {
  id: string
  date: string
  type: string
  setting: string
  location: string
  address?: string
  reason: string
  vitals: Record<string, number>
  labs: Record<string, number>
  diagnosesEvents: DiagnosisEvent[]
  medicationEvents: MedicationEvent[]
  notes: string
}

export type DiagnosisEvent = {
  id: string
  code: string
  label: string
  action: 'start' | 'exacerbation' | 'exacerbation_end' | 'resolve' | 'addressed'
}

export type MedicationEvent = {
  id: string
  name: string
  dose: string
  route: string
  frequency: string
  action: 'start' | 'change' | 'restart' | 'stop'
  indication?: string
}

export type Segment = {
  id: string
  type: 'encounter' | 'gap'
  date?: string
  startDate?: string
  endDate?: string
  durationDays?: number
  magnitude?: 'minimal' | 'moderate' | 'extended'
  label: string
  encounterId?: string
}

export type DomainConfig = {
  defaultTrackOrder: string[]
  tracks: Record<string, TrackConfig>
}

export type TrackConfig = {
  type: 'continuous' | 'point_in_time' | 'structural' | 'patient_reported'
  subtypes: string[]
}

export type CellData = {
  segmentId: string
  subtypeId: string
  trackName: string
  values: string | string[]
  metadata?: Record<string, unknown>
}

export type PeekCardState = {
  isVisible: boolean
  cellData?: CellData
  segment?: Segment
  x?: number
  y?: number
}

export type ContextHighlightState = {
  segmentId?: string
}

export type DiagnosisExacerbation = {
  startEncounterId: string
  startDate: string
  endEncounterId?: string
  endDate?: string
  label?: string
}

export type DiagnosisPeriod = {
  id: string
  label: string
  code: string
  startEncounterId: string
  startDate: string
  endEncounterId?: string
  endDate?: string
  exacerbations: DiagnosisExacerbation[]
  addressedEncounterIds: string[]
}

export type DoseSegment = {
  startEncounterId: string
  startDate: string
  endEncounterId?: string
  endDate?: string
  dose: string
  therapeuticLevel: 'below' | 'at' | 'above'
  route: string
  frequency: string
}

export type MedicationPeriod = {
  id: string
  name: string
  startEncounterId: string
  startDate: string
  endEncounterId?: string
  endDate?: string
  doseSegments: DoseSegment[]
  indication?: string
}

export type RangeConfig = {
  min: number
  max: number
  unit: string
  label: string
  criticalLow?: number
  low?: number
  depressed?: number
  normalLow: number
  normalHigh: number
  elevated?: number
  high?: number
  criticalHigh?: number
}

export type EncounterTypeKey =
  | 'PCP' | 'ER' | 'UC' | 'SP' | 'PSY' | 'IP'
  | 'OP' | 'PT' | 'OB' | 'HM' | 'DX' | 'OTHER'

export type EncounterTypeStyle = {
  bg: string
  fg: string
  bd: string
}

export type TooltipPosition = 'top' | 'left' | 'right'

export type VisibleTracks = {
  patient_reported: boolean
  diagnoses: boolean
  encounters: boolean
  vitals: boolean
  labs: boolean
  medications?: boolean
  [key: string]: boolean | undefined
}

export type TimelineSettingsState = {
  visibleTracks: VisibleTracks
  showGaps: boolean
}

export type NavTab = {
  startIndex: number
  endIndex: number
  startDate: string
  endDate: string
  encounterCount: number
}
