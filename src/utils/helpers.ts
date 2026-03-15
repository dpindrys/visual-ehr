import { Encounter, EncounterTypeKey, EncounterTypeStyle } from './types'

export const daysBetween = (startStr: string, endStr: string): number => {
  const start = new Date(startStr)
  const end = new Date(endStr)
  return Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
}

export const monthsBetween = (startStr: string, endStr: string): number => {
  const start = new Date(startStr)
  const end = new Date(endStr)
  return (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth())
}

export const getGapMagnitude = (
  startStr: string,
  endStr: string
): 'minimal' | 'moderate' | 'extended' => {
  const days = daysBetween(startStr, endStr)
  const months = monthsBetween(startStr, endStr)
  if (days < 30) return 'minimal'
  if (months <= 3) return 'moderate'
  return 'extended'
}

export const getGapLabel = (startStr: string, endStr: string): string => {
  const days = daysBetween(startStr, endStr)
  if (days < 30) return `${days}`
  if (days <= 180) return `${days}`
  return `${days} days`
}

export const getGapWidth = (durationDays: number): number => {
  if (durationDays < 30) return 25
  if (durationDays <= 180) return 50
  return 100
}

export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export const formatDateShort = (dateStr: string): string => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export const formatDateTime = (dateStr: string): string => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export const formatDateDDMonYYYY = (dateStr: string): string => {
  const date = new Date(dateStr)
  const day = date.getDate().toString().padStart(2, '0')
  const month = date.toLocaleDateString('en-US', { month: 'short' })
  const year = date.getFullYear()
  return `${day}-${month}-${year}`
}

export const formatDateMonDayYear = (dateStr: string): string => {
  const date = new Date(dateStr)
  const month = date.toLocaleDateString('en-US', { month: 'short' })
  const day = date.getDate()
  const year = date.getFullYear()
  return `${month} ${day}, ${year}`
}

export const formatDateMonDayYearSpaced = (dateStr: string): string => {
  const date = new Date(dateStr)
  const month = date.toLocaleDateString('en-US', { month: 'short' })
  const day = date.getDate()
  const year = date.getFullYear()
  return `${month} ${day} ${year}`
}

export const formatTabDate = (dateStr: string): string => {
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) {
    return dateStr.split(',')[0] || dateStr.substring(0, 8)
  }
  const month = date.toLocaleDateString('en-US', { month: 'short' })
  const year = date.getFullYear().toString().slice(-2)
  return `${month} '${year}`
}

export const sortEncountersByDate = (dates: string[]): string[] => {
  return [...dates].sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
}

// ============================================
// Encounter Type Classification
// ============================================

export const ENCOUNTER_TYPE_COLORS: Record<EncounterTypeKey, EncounterTypeStyle> = {
  PCP: { bg: '#2563EB', fg: '#FFFFFF', bd: '#1D4ED8' },
  ER: { bg: '#DC2626', fg: '#FFFFFF', bd: '#B91C1C' },
  UC: { bg: '#C2410C', fg: '#FFFFFF', bd: '#9A3412' },
  SP: { bg: '#7C3AED', fg: '#FFFFFF', bd: '#6D28D9' },
  PSY: { bg: '#047857', fg: '#FFFFFF', bd: '#065F46' },
  IP: { bg: '#475569', fg: '#FFFFFF', bd: '#334155' },
  OP: { bg: '#B45309', fg: '#FFFFFF', bd: '#92400E' },
  PT: { bg: '#A16207', fg: '#FFFFFF', bd: '#854D0E' },
  OB: { bg: '#DB2777', fg: '#FFFFFF', bd: '#BE185D' },
  HM: { bg: '#0E7490', fg: '#FFFFFF', bd: '#155E75' },
  DX: { bg: '#E5E7EB', fg: '#111827', bd: '#9CA3AF' },
  OTHER: { bg: '#6b7280', fg: '#FFFFFF', bd: '#5F6673' },
}

export function getEncounterTypeKey(encounter: Encounter): EncounterTypeKey {
  const setting = (encounter.setting || '').toLowerCase()
  const type = (encounter.type || '').toLowerCase()

  if (setting.includes('primary') || type.includes('primary')) return 'PCP'
  if (setting.includes('emergency') || setting === 'ed' || type.includes('emergency')) return 'ER'
  if (setting.includes('urgent') || type.includes('urgent')) return 'UC'
  if (setting.includes('specialty') || type.includes('specialty') ||
      setting.includes('specialist') || type.includes('specialist')) return 'SP'
  if (setting.includes('psych') || type.includes('psych') ||
      setting.includes('behavioral') || type.includes('behavioral') ||
      setting.includes('mental health') || type.includes('mental health')) return 'PSY'
  if (setting.includes('inpatient') || type.includes('inpatient') ||
      (setting.includes('hospital') && !setting.includes('outpatient'))) return 'IP'
  if (setting.includes('outpatient') || type.includes('outpatient')) return 'OP'
  if (setting.includes('physical therapy') || setting.includes('pt ') ||
      type.includes('physical therapy') || type.includes('pt ')) return 'PT'
  if (setting.includes('ob') || setting.includes('obstetric') || setting.includes('gynec') ||
      type.includes('ob') || type.includes('obstetric') || type.includes('gynec')) return 'OB'
  if (setting.includes('home') || type.includes('home')) return 'HM'
  if (setting.includes('diagnostic') || setting.includes('dx') ||
      type.includes('diagnostic') || type.includes('dx')) return 'DX'
  return 'OTHER'
}

export function getEncounterTypeColors(key: EncounterTypeKey): EncounterTypeStyle {
  return ENCOUNTER_TYPE_COLORS[key] ?? ENCOUNTER_TYPE_COLORS.OTHER
}

export function formatSetting(setting?: string): string {
  if (!setting) return ''
  const s = setting.toLowerCase()
  if (s.includes('primary')) return 'PCP'
  if (s.includes('urgent')) return 'UC'
  if (s.includes('emergency') || s === 'ed') return 'ED'
  return setting
}

// Find the segment index closest to a given date
export function findSegmentIndexForDate(
  segments: { type: string; date?: string; startDate?: string; endDate?: string }[],
  targetDate: string
): number {
  for (let i = segments.length - 1; i >= 0; i--) {
    const seg = segments[i]
    if (seg.type === 'encounter' && seg.date && seg.date <= targetDate) return i
  }
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i]
    if (seg.type === 'encounter' && seg.date && seg.date >= targetDate) return i
  }
  return segments.length - 1
}

// PRO-specific: exact encounter match first, then gap containment, then nearest fallback
export function findSegmentIndexForDateWithGaps(
  segments: { type: string; date?: string; startDate?: string; endDate?: string }[],
  targetDate: string
): number {
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i]
    if (seg.type === 'encounter' && seg.date === targetDate) return i
  }
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i]
    if (seg.type === 'gap' && seg.startDate && seg.endDate &&
        targetDate > seg.startDate && targetDate < seg.endDate) return i
  }
  for (let i = segments.length - 1; i >= 0; i--) {
    const seg = segments[i]
    if (seg.type === 'encounter' && seg.date && seg.date <= targetDate) return i
  }
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i]
    if (seg.type === 'encounter' && seg.date && seg.date >= targetDate) return i
  }
  return segments.length - 1
}
