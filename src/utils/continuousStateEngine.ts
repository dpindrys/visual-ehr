import { PatientData, Segment, Encounter, DiagnosisEvent, MedicationEvent } from './types';

// Utility to compute fill-forward state for continuous domains (diagnoses, medications)
export type ActiveDiagnosis = {
  id: string;
  code: string;
  label: string;
  startEncounterId: string;
  endEncounterId?: string;
  action: DiagnosisEvent['action'];
};

export type ActiveMedication = {
  id: string;
  name: string;
  dose: string;
  route: string;
  frequency: string;
  startEncounterId: string;
  endEncounterId?: string;
  action: MedicationEvent['action'];
};

// Returns a map: { [segmentId]: ActiveDiagnosis[] } for each segment
export function computeActiveDiagnosesBySegment(
  patientData: PatientData,
  segments: Segment[]
): Record<string, ActiveDiagnosis[]> {
  // For MVP, treat all diagnoses as a single subtype row (problem_list)
  const result: Record<string, ActiveDiagnosis[]> = {};
  let active: ActiveDiagnosis[] = [];

  for (const segment of segments) {
    if (segment.type === 'encounter' && segment.encounterId) {
      const encounter = patientData.encounters.find(e => e.id === segment.encounterId);
      if (encounter && encounter.diagnosesEvents) {
        // Process events: start, exacerbation, resolve
        for (const event of encounter.diagnosesEvents) {
          if (event.action === 'start' || event.action === 'exacerbation') {
            // If not already active, add
            if (!active.some(a => a.id === event.id)) {
              active.push({
                id: event.id,
                code: event.code,
                label: event.label,
                startEncounterId: encounter.id,
                action: event.action,
              });
            }
          } else if (event.action === 'resolve') {
            // Remove from active
            active = active.map(a =>
              a.id === event.id && !a.endEncounterId
                ? { ...a, endEncounterId: encounter.id }
                : a
            );
          }
        }
        // Remove resolved
        active = active.filter(a => !a.endEncounterId);
      }
    }
    // For each segment, assign current active
    result[segment.id] = [...active];
  }
  return result;
}

// Returns a map: { [segmentId]: ActiveMedication[] } for each segment
export function computeActiveMedicationsBySegment(
  patientData: PatientData,
  segments: Segment[]
): Record<string, ActiveMedication[]> {
  // For MVP, use medication name as subtype
  const result: Record<string, ActiveMedication[]> = {};
  let active: ActiveMedication[] = [];

  for (const segment of segments) {
    if (segment.type === 'encounter' && segment.encounterId) {
      const encounter = patientData.encounters.find(e => e.id === segment.encounterId);
      if (encounter && encounter.medicationEvents) {
        for (const event of encounter.medicationEvents) {
          if (event.action === 'start' || event.action === 'restart' || event.action === 'change') {
            // Remove any previous with same name (for dose change)
            active = active.filter(a => a.name.toLowerCase() !== event.name.toLowerCase());
            active.push({
              id: event.id,
              name: event.name,
              dose: event.dose,
              route: event.route,
              frequency: event.frequency,
              startEncounterId: encounter.id,
              action: event.action,
            });
          } else if (event.action === 'stop') {
            // Mark as ended
            active = active.map(a =>
              a.name.toLowerCase() === event.name.toLowerCase() && !a.endEncounterId
                ? { ...a, endEncounterId: encounter.id }
                : a
            );
          }
        }
        // Remove stopped
        active = active.filter(a => !a.endEncounterId);
      }
    }
    result[segment.id] = [...active];
  }
  return result;
}