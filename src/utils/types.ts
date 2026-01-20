// Type definitions for VisualEHR

export type PatientData = {
  patient: {
    id: string
    name: string
    dob: string
    sex: string
    mrn: string
    summary: {
      allergies: string[]
      careTeam: string[]
      problemsAtAGlance: string[]
    }
  }
  encounters: Encounter[]
  domainConfig: DomainConfig
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
  action: 'start' | 'exacerbation' | 'resolve'
}

export type MedicationEvent = {
  id: string
  name: string
  dose: string
  route: string
  frequency: string
  action: 'start' | 'change' | 'restart' | 'stop'
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
  type: 'continuous' | 'point_in_time' | 'structural'
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
