import {
  PatientData, Segment, DiagnosisPeriod, DiagnosisExacerbation,
  MedicationPeriod, DoseSegment,
} from './types'

// ============================================
// Diagnosis Period Computation
// ============================================

function getBaseIcdCode(code: string): string {
  const dotIndex = code.indexOf('.')
  return dotIndex > 0 ? code.substring(0, dotIndex) : code
}

export function computeDiagnosisPeriods(patientData: PatientData): DiagnosisPeriod[] {
  const periods: DiagnosisPeriod[] = []
  const activeByCode = new Map<string, DiagnosisPeriod>()
  const activeExacerbations = new Map<string, DiagnosisExacerbation>()

  const sortedEncounters = [...patientData.encounters].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  )

  for (const encounter of sortedEncounters) {
    for (const event of encounter.diagnosesEvents) {
      const baseCode = getBaseIcdCode(event.code)

      switch (event.action) {
        case 'start': {
          const period: DiagnosisPeriod = {
            id: event.id,
            label: event.label,
            code: event.code,
            startEncounterId: encounter.id,
            startDate: encounter.date,
            exacerbations: [],
            addressedEncounterIds: [encounter.id],
          }
          activeByCode.set(baseCode, period)
          periods.push(period)
          break
        }
        case 'exacerbation': {
          const period = activeByCode.get(baseCode)
          if (period) {
            const exacerbation: DiagnosisExacerbation = {
              startEncounterId: encounter.id,
              startDate: encounter.date,
              label: event.label,
            }
            activeExacerbations.set(baseCode, exacerbation)
            period.exacerbations.push(exacerbation)
            if (!period.addressedEncounterIds.includes(encounter.id)) {
              period.addressedEncounterIds.push(encounter.id)
            }
          }
          break
        }
        case 'exacerbation_end': {
          const exac = activeExacerbations.get(baseCode)
          if (exac) {
            exac.endEncounterId = encounter.id
            exac.endDate = encounter.date
            activeExacerbations.delete(baseCode)
          }
          const period = activeByCode.get(baseCode)
          if (period && !period.addressedEncounterIds.includes(encounter.id)) {
            period.addressedEncounterIds.push(encounter.id)
          }
          break
        }
        case 'resolve': {
          const period = activeByCode.get(baseCode)
          if (period) {
            period.endEncounterId = encounter.id
            period.endDate = encounter.date
            if (!period.addressedEncounterIds.includes(encounter.id)) {
              period.addressedEncounterIds.push(encounter.id)
            }
            activeByCode.delete(baseCode)
          }
          const exac = activeExacerbations.get(baseCode)
          if (exac && !exac.endDate) {
            exac.endEncounterId = encounter.id
            exac.endDate = encounter.date
            activeExacerbations.delete(baseCode)
          }
          break
        }
        case 'addressed': {
          const period = activeByCode.get(baseCode)
          if (period && !period.addressedEncounterIds.includes(encounter.id)) {
            period.addressedEncounterIds.push(encounter.id)
          }
          break
        }
      }
    }
  }

  return periods
}

export function filterDiagnosisBySubtype(
  periods: DiagnosisPeriod[],
  subtypeName: string
): DiagnosisPeriod[] {
  const matchers: Record<string, (p: DiagnosisPeriod) => boolean> = {
    type_2_diabetes: (p) =>
      p.code.startsWith('E11') || p.label.toLowerCase().includes('diabetes'),
    hypertension: (p) =>
      p.code.startsWith('I10') || p.label.toLowerCase().includes('hypertension'),
    hypothyroidism: (p) =>
      p.code.startsWith('E03') || p.label.toLowerCase().includes('hypothyroid'),
    anemia: (p) =>
      p.code.startsWith('D64') || p.label.toLowerCase().includes('anemia'),
    ckd: (p) =>
      p.code.startsWith('N18') ||
      p.label.toLowerCase().includes('ckd') ||
      p.label.toLowerCase().includes('chronic kidney'),
  }

  const matcher = matchers[subtypeName]
  if (matcher) return periods.filter(matcher)

  return periods.filter((p) =>
    p.label.toLowerCase().includes(subtypeName.replace(/_/g, ' '))
  )
}

// ============================================
// Medication Period Computation
// ============================================

const THERAPEUTIC_DOSE_RANGES: Record<string, {
  targetMg?: number; targetMcg?: number;
  unit: string;
  rangeMg?: [number, number]; rangeMcg?: [number, number]
}> = {
  metformin: { targetMg: 1000, unit: 'mg', rangeMg: [1000, 2000] },
  lisinopril: { targetMg: 10, unit: 'mg', rangeMg: [10, 40] },
  atorvastatin: { targetMg: 20, unit: 'mg', rangeMg: [10, 80] },
  levothyroxine: { targetMcg: 50, unit: 'mcg', rangeMcg: [25, 150] },
  'ferrous sulfate': { targetMg: 325, unit: 'mg', rangeMg: [325, 325] },
}

function parseDose(doseStr: string): { value: number; unit: string } | null {
  const text = (doseStr || '').trim().toLowerCase()
  const mgMatch = text.match(/^([\d.]+)\s*mg/)
  if (mgMatch) {
    const value = parseFloat(mgMatch[1])
    if (!Number.isNaN(value)) return { value, unit: 'mg' }
  }
  const mcgMatch = text.match(/^([\d.]+)\s*mcg/)
  if (mcgMatch) {
    const value = parseFloat(mcgMatch[1])
    if (!Number.isNaN(value)) return { value, unit: 'mcg' }
  }
  return null
}

function normalizeMedName(name: string): string {
  return (name || '').trim().toLowerCase()
}

export function getTherapeuticLevel(
  medName: string,
  doseStr: string
): 'below' | 'at' | 'above' {
  const parsed = parseDose(doseStr)
  if (!parsed) return 'at'

  const normalized = normalizeMedName(medName)
  const config = THERAPEUTIC_DOSE_RANGES[normalized]
  if (!config) return 'at'

  if (config.unit === 'mg') {
    const valueMg = parsed.unit === 'mg' ? parsed.value : parsed.value / 1000
    const range = config.rangeMg ?? (config.targetMg != null ? [config.targetMg, config.targetMg] : null)
    if (!range) return 'at'
    return valueMg < range[0] ? 'below' : valueMg > range[1] ? 'above' : 'at'
  }

  const valueMcg = parsed.unit === 'mcg' ? parsed.value : parsed.value * 1000
  const range = config.rangeMcg ?? (config.targetMcg != null ? [config.targetMcg, config.targetMcg] : null)
  if (!range) return 'at'
  return valueMcg < range[0] ? 'below' : valueMcg > range[1] ? 'above' : 'at'
}

export function getTherapeuticDoseRange(medName: string): string {
  const normalized = normalizeMedName(medName)
  const config = THERAPEUTIC_DOSE_RANGES[normalized]
  if (!config) return ''

  if (config.unit === 'mg') {
    const range = config.rangeMg ?? (config.targetMg != null ? [config.targetMg, config.targetMg] : null)
    if (!range) return ''
    const [low, high] = range
    return low === high ? `${low} mg daily` : `${low}–${high} mg daily`
  }

  const range = config.rangeMcg ?? (config.targetMcg != null ? [config.targetMcg, config.targetMcg] : null)
  if (!range) return ''
  const [low, high] = range
  return low === high ? `${low} mcg daily` : `${low}–${high} mcg daily`
}

export function computeMedicationPeriods(patientData: PatientData): MedicationPeriod[] {
  const periods: MedicationPeriod[] = []
  const activeByName = new Map<string, MedicationPeriod>()

  const sortedEncounters = [...patientData.encounters].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  )

  for (const encounter of sortedEncounters) {
    if (!encounter.medicationEvents) continue

    for (const event of encounter.medicationEvents) {
      const normalizedName = normalizeMedName(event.name)

      if (event.action === 'stop') {
        const period = activeByName.get(normalizedName)
        if (period && period.doseSegments.length > 0) {
          const lastDose = period.doseSegments[period.doseSegments.length - 1]
          lastDose.endEncounterId = encounter.id
          lastDose.endDate = encounter.date
          period.endEncounterId = encounter.id
          period.endDate = encounter.date
          activeByName.delete(normalizedName)
        }
        continue
      }

      if (event.action === 'start' || event.action === 'restart' || event.action === 'change') {
        let period = activeByName.get(normalizedName)

        if (period && period.doseSegments.length > 0) {
          const lastDose = period.doseSegments[period.doseSegments.length - 1]
          lastDose.endEncounterId = encounter.id
          lastDose.endDate = encounter.date
        }

        const therapeuticLevel = getTherapeuticLevel(event.name, event.dose)
        const doseSegment: DoseSegment = {
          startEncounterId: encounter.id,
          startDate: encounter.date,
          dose: event.dose,
          therapeuticLevel,
          route: event.route,
          frequency: event.frequency,
        }

        if (!period) {
          period = {
            id: event.id,
            name: event.name,
            startEncounterId: encounter.id,
            startDate: encounter.date,
            doseSegments: [],
            indication: event.indication,
          }
          activeByName.set(normalizedName, period)
          periods.push(period)
        }

        period.doseSegments.push(doseSegment)
      }
    }
  }

  return periods
}

export function filterMedicationsBySubtype(
  periods: MedicationPeriod[],
  subtypeName: string
): MedicationPeriod[] {
  const normalized = normalizeMedName(subtypeName.replace(/_/g, ' '))
  return periods.filter((p) => normalizeMedName(p.name) === normalized)
}

// ============================================
// Legacy fill-forward APIs (kept for Cell.tsx)
// ============================================

export type ActiveDiagnosis = {
  id: string
  code: string
  label: string
  startEncounterId: string
  endEncounterId?: string
  action: 'start' | 'exacerbation' | 'exacerbation_end' | 'resolve' | 'addressed'
}

export type ActiveMedication = {
  id: string
  name: string
  dose: string
  route: string
  frequency: string
  startEncounterId: string
  endEncounterId?: string
  action: 'start' | 'change' | 'restart' | 'stop'
}

export function computeActiveDiagnosesBySegment(
  patientData: PatientData,
  segments: Segment[]
): Record<string, ActiveDiagnosis[]> {
  const result: Record<string, ActiveDiagnosis[]> = {}
  let active: ActiveDiagnosis[] = []

  for (const segment of segments) {
    if (segment.type === 'encounter' && segment.encounterId) {
      const encounter = patientData.encounters.find(e => e.id === segment.encounterId)
      if (encounter && encounter.diagnosesEvents) {
        for (const event of encounter.diagnosesEvents) {
          if (event.action === 'start' || event.action === 'exacerbation') {
            if (!active.some(a => a.id === event.id)) {
              active.push({
                id: event.id,
                code: event.code,
                label: event.label,
                startEncounterId: encounter.id,
                action: event.action,
              })
            }
          } else if (event.action === 'resolve') {
            active = active.map(a =>
              a.id === event.id && !a.endEncounterId
                ? { ...a, endEncounterId: encounter.id }
                : a
            )
          }
        }
        active = active.filter(a => !a.endEncounterId)
      }
    }
    result[segment.id] = [...active]
  }
  return result
}

export function computeActiveMedicationsBySegment(
  patientData: PatientData,
  segments: Segment[]
): Record<string, ActiveMedication[]> {
  const result: Record<string, ActiveMedication[]> = {}
  let active: ActiveMedication[] = []

  for (const segment of segments) {
    if (segment.type === 'encounter' && segment.encounterId) {
      const encounter = patientData.encounters.find(e => e.id === segment.encounterId)
      if (encounter && encounter.medicationEvents) {
        for (const event of encounter.medicationEvents) {
          if (event.action === 'start' || event.action === 'restart' || event.action === 'change') {
            active = active.filter(a => a.name.toLowerCase() !== event.name.toLowerCase())
            active.push({
              id: event.id,
              name: event.name,
              dose: event.dose,
              route: event.route,
              frequency: event.frequency,
              startEncounterId: encounter.id,
              action: event.action,
            })
          } else if (event.action === 'stop') {
            active = active.map(a =>
              a.name.toLowerCase() === event.name.toLowerCase() && !a.endEncounterId
                ? { ...a, endEncounterId: encounter.id }
                : a
            )
          }
        }
        active = active.filter(a => !a.endEncounterId)
      }
    }
    result[segment.id] = [...active]
  }
  return result
}
