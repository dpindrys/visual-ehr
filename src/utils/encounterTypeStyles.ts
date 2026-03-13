import { Encounter, EncounterTypeKey, EncounterTypeStyle } from './types'

export const encounterTypeColors: Record<EncounterTypeKey, EncounterTypeStyle> = {
  PCP:   { bg: '#2563EB', fg: '#FFFFFF', bd: '#1D4ED8' },
  ER:    { bg: '#DC2626', fg: '#FFFFFF', bd: '#B91C1C' },
  UC:    { bg: '#C2410C', fg: '#FFFFFF', bd: '#9A3412' },
  SP:    { bg: '#7C3AED', fg: '#FFFFFF', bd: '#6D28D9' },
  PSY:   { bg: '#047857', fg: '#FFFFFF', bd: '#065F46' },
  IP:    { bg: '#475569', fg: '#FFFFFF', bd: '#334155' },
  OP:    { bg: '#B45309', fg: '#FFFFFF', bd: '#92400E' },
  PT:    { bg: '#A16207', fg: '#FFFFFF', bd: '#854D0E' },
  OB:    { bg: '#DB2777', fg: '#FFFFFF', bd: '#BE185D' },
  HM:    { bg: '#0E7490', fg: '#FFFFFF', bd: '#155E75' },
  DX:    { bg: '#E5E7EB', fg: '#111827', bd: '#9CA3AF' },
  OTHER: { bg: '#6b7280', fg: '#FFFFFF', bd: '#5F6673' },
}

/** Classify an encounter into a short type key based on setting and type fields */
export function getEncounterTypeKey(encounter: Encounter): EncounterTypeKey {
  const setting = (encounter.setting || '').toLowerCase()
  const type = (encounter.type || '').toLowerCase()

  if (setting.includes('primary') || type.includes('primary')) return 'PCP'
  if (setting.includes('emergency') || setting === 'ed' || type.includes('emergency')) return 'ER'
  if (setting.includes('urgent') || type.includes('urgent')) return 'UC'
  if (
    setting.includes('specialty') || type.includes('specialty') ||
    setting.includes('specialist') || type.includes('specialist')
  ) return 'SP'
  if (
    setting.includes('psych') || type.includes('psych') ||
    setting.includes('behavioral') || type.includes('behavioral') ||
    setting.includes('mental health') || type.includes('mental health')
  ) return 'PSY'
  if (
    setting.includes('inpatient') || type.includes('inpatient') ||
    (setting.includes('hospital') && !setting.includes('outpatient'))
  ) return 'IP'
  if (setting.includes('outpatient') || type.includes('outpatient')) return 'OP'
  if (
    setting.includes('physical therapy') || setting.includes('pt ') ||
    type.includes('physical therapy') || type.includes('pt ')
  ) return 'PT'
  if (
    setting.includes('ob') || setting.includes('obstetric') || setting.includes('gynec') ||
    type.includes('ob') || type.includes('obstetric') || type.includes('gynec')
  ) return 'OB'
  if (setting.includes('home') || type.includes('home')) return 'HM'
  if (
    setting.includes('diagnostic') || setting.includes('dx') ||
    type.includes('diagnostic') || type.includes('dx')
  ) return 'DX'

  return 'OTHER'
}

/** Get the color style for a given encounter type key */
export function getEncounterTypeStyle(key: EncounterTypeKey): EncounterTypeStyle {
  return encounterTypeColors[key] ?? encounterTypeColors.OTHER
}
