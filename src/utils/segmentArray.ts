// Segment array generation: converts encounters into compressed timeline segments

import { PatientData, Segment, Encounter } from './types'
import { sortEncountersByDate, getGapMagnitude, getGapLabel, formatDate, daysBetween } from './helpers'

export const generateSegmentArray = (patientData: PatientData): Segment[] => {
  const encounters = patientData.encounters
  if (!encounters || encounters.length === 0) {
    return []
  }

  // Extract and sort encounter dates
  const encounterDates = sortEncountersByDate(encounters.map((e) => e.date))

  const segments: Segment[] = []

  for (let i = 0; i < encounterDates.length; i++) {
    const currentDate = encounterDates[i]
    const encounter = encounters.find((e) => e.date === currentDate)

    // Add encounter segment
    segments.push({
      id: `enc-${currentDate}`,
      type: 'encounter',
      date: currentDate,
      label: formatDate(currentDate),
      encounterId: encounter?.id,
    })

    // Add gap segment if there's a next encounter
    if (i < encounterDates.length - 1) {
      const nextDate = encounterDates[i + 1]
      const magnitude = getGapMagnitude(currentDate, nextDate)
      const durationDays = daysBetween(currentDate, nextDate)
      const label = getGapLabel(currentDate, nextDate)

      segments.push({
        id: `gap-${i}`,
        type: 'gap',
        startDate: currentDate,
        endDate: nextDate,
        durationDays,
        magnitude,
        label,
      })
    }
  }

  return segments
}

export const getEncounterByDate = (patientData: PatientData, date: string): Encounter | undefined => {
  return patientData.encounters.find((e) => e.date === date)
}

export const getEncounterById = (patientData: PatientData, encounterId: string): Encounter | undefined => {
  return patientData.encounters.find((e) => e.id === encounterId)
}
