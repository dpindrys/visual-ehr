import { RangeConfig } from './types'

export type ValueStatus =
  | 'normal'
  | 'elevated'
  | 'high'
  | 'critical-high'
  | 'low'
  | 'critical-low'
  | 'depressed'

// ============================================
// VITALS
// ============================================

export function getHeartRateStatus(hr: number): ValueStatus {
  if (hr < 40) return 'critical-low'
  if (hr < 50) return 'low'
  if (hr <= 100) return 'normal'
  if (hr <= 110) return 'elevated'
  if (hr <= 130) return 'high'
  return 'critical-high'
}

export function getBloodPressureStatus(systolic: number, diastolic: number): ValueStatus {
  if (systolic >= 180 || diastolic >= 120) return 'critical-high'
  if (systolic < 80 || diastolic < 50) return 'critical-low'
  if (systolic < 90 || diastolic < 60) return 'low'
  if (systolic >= 130 || diastolic >= 80) return 'high'
  if (systolic >= 120 && diastolic < 80) return 'elevated'
  return 'normal'
}

export function getSpO2Status(spo2: number): ValueStatus {
  if (spo2 < 85) return 'critical-low'
  if (spo2 < 90) return 'low'
  if (spo2 < 93) return 'depressed'
  return 'normal'
}

export function getTemperatureStatus(tempC: number): ValueStatus {
  if (tempC < 34.0) return 'critical-low'
  if (tempC < 36.0) return 'low'
  if (tempC < 38.0) return 'normal'
  if (tempC < 38.5) return 'elevated'
  if (tempC <= 40.0) return 'high'
  return 'critical-high'
}

// ============================================
// LABS
// ============================================

export function getA1cStatus(a1c: number): ValueStatus {
  if (a1c < 5.7) return 'normal'
  if (a1c < 6.5) return 'elevated'
  if (a1c < 9.0) return 'high'
  return 'critical-high'
}

export function getGlucoseStatus(glucose: number): ValueStatus {
  if (glucose < 54) return 'critical-low'
  if (glucose < 70) return 'low'
  if (glucose < 140) return 'normal'
  if (glucose < 200) return 'elevated'
  if (glucose < 300) return 'high'
  return 'critical-high'
}

export function getLdlStatus(ldl: number): ValueStatus {
  if (ldl < 100) return 'normal'
  if (ldl < 130) return 'elevated'
  if (ldl < 190) return 'high'
  return 'critical-high'
}

export function getTriglyceridesStatus(trig: number): ValueStatus {
  if (trig < 150) return 'normal'
  if (trig < 200) return 'elevated'
  if (trig < 500) return 'high'
  return 'critical-high'
}

export function getCreatinineStatus(cr: number): ValueStatus {
  if (cr <= 1.2) return 'normal'
  if (cr < 2.0) return 'elevated'
  if (cr < 4.0) return 'high'
  return 'critical-high'
}

export function getBunStatus(bun: number): ValueStatus {
  if (bun < 7) return 'low'
  if (bun <= 20) return 'normal'
  if (bun < 30) return 'elevated'
  if (bun < 60) return 'high'
  return 'critical-high'
}

export function getTshStatus(tsh: number): ValueStatus {
  if (tsh < 0.10) return 'critical-low'
  if (tsh < 0.40) return 'low'
  if (tsh <= 4.0) return 'normal'
  if (tsh < 10) return 'elevated'
  if (tsh < 20) return 'high'
  return 'critical-high'
}

export function getEgfrStatus(egfr: number): ValueStatus {
  if (egfr >= 90) return 'normal'
  if (egfr >= 60) return 'depressed'
  if (egfr >= 30) return 'low'
  return 'critical-low'
}

export function getSodiumStatus(sodium: number): ValueStatus {
  if (sodium < 120) return 'critical-low'
  if (sodium < 130) return 'low'
  if (sodium <= 145) return 'normal'
  if (sodium <= 155) return 'high'
  return 'critical-high'
}

export function getPotassiumStatus(potassium: number): ValueStatus {
  if (potassium < 2.5) return 'critical-low'
  if (potassium < 3.5) return 'low'
  if (potassium <= 5.0) return 'normal'
  if (potassium < 6.0) return 'high'
  return 'critical-high'
}

// ============================================
// Generic getters by type
// ============================================

export function getVitalStatus(vitalType: string, value: number, value2?: number): ValueStatus {
  switch (vitalType) {
    case 'hr': return getHeartRateStatus(value)
    case 'bp': return getBloodPressureStatus(value, value2 ?? 80)
    case 'spo2': return getSpO2Status(value)
    case 'temp_c': return getTemperatureStatus(value)
    default: return 'normal'
  }
}

export function getLabStatus(labType: string, value: number): ValueStatus {
  switch (labType) {
    case 'a1c_pct': return getA1cStatus(value)
    case 'glucose_mg_dl': return getGlucoseStatus(value)
    case 'ldl_mg_dl': return getLdlStatus(value)
    case 'triglycerides_mg_dl': return getTriglyceridesStatus(value)
    case 'creatinine_mg_dl': return getCreatinineStatus(value)
    case 'bun_mg_dl': return getBunStatus(value)
    case 'tsh_miu_l': return getTshStatus(value)
    case 'efgr_ml_min': return getEgfrStatus(value)
    case 'sodium_meq_l': return getSodiumStatus(value)
    case 'potassium_meq_l': return getPotassiumStatus(value)
    default: return 'normal'
  }
}

// ============================================
// Range Configs
// ============================================

const VITALS_RANGE_CONFIGS: Record<string, RangeConfig> = {
  hr: { min: 30, max: 160, unit: 'bpm', label: 'Heart Rate', criticalLow: 40, low: 50, normalLow: 50, normalHigh: 100, elevated: 110, high: 130, criticalHigh: 130 },
  bp_sys: { min: 70, max: 200, unit: 'mmHg', label: 'Systolic BP', criticalLow: 80, low: 90, normalLow: 90, normalHigh: 120, elevated: 130, high: 140, criticalHigh: 180 },
  bp_dia: { min: 40, max: 130, unit: 'mmHg', label: 'Diastolic BP', criticalLow: 50, low: 60, normalLow: 60, normalHigh: 80, high: 90, criticalHigh: 120 },
  spo2: { min: 70, max: 100, unit: '%', label: 'SpO2', criticalLow: 85, low: 90, depressed: 93, normalLow: 93, normalHigh: 100 },
  temp_c: { min: 33, max: 42, unit: '°C', label: 'Temperature', criticalLow: 34, low: 36, normalLow: 36, normalHigh: 38, elevated: 38.5, high: 40, criticalHigh: 40 },
}

const LABS_RANGE_CONFIGS: Record<string, RangeConfig> = {
  a1c_pct: { min: 4, max: 14, unit: '%', label: 'HbA1c', normalLow: 4, normalHigh: 5.7, elevated: 6.5, high: 9, criticalHigh: 9 },
  glucose_mg_dl: { min: 40, max: 400, unit: 'mg/dL', label: 'Glucose', criticalLow: 54, low: 70, normalLow: 70, normalHigh: 140, elevated: 200, high: 300, criticalHigh: 300 },
  ldl_mg_dl: { min: 40, max: 250, unit: 'mg/dL', label: 'LDL Cholesterol', normalLow: 40, normalHigh: 100, elevated: 130, high: 190, criticalHigh: 190 },
  triglycerides_mg_dl: { min: 40, max: 600, unit: 'mg/dL', label: 'Triglycerides', normalLow: 40, normalHigh: 150, elevated: 200, high: 500, criticalHigh: 500 },
  creatinine_mg_dl: { min: 0.4, max: 6, unit: 'mg/dL', label: 'Creatinine', normalLow: 0.4, normalHigh: 1.2, elevated: 2, high: 4, criticalHigh: 4 },
  bun_mg_dl: { min: 5, max: 80, unit: 'mg/dL', label: 'BUN', low: 7, normalLow: 7, normalHigh: 20, elevated: 30, high: 60, criticalHigh: 60 },
  tsh_miu_l: { min: 0, max: 25, unit: 'mIU/L', label: 'TSH', criticalLow: 0.1, low: 0.4, normalLow: 0.4, normalHigh: 4, elevated: 10, high: 20, criticalHigh: 20 },
  efgr_ml_min: { min: 10, max: 120, unit: 'mL/min', label: 'eGFR', criticalLow: 30, low: 60, depressed: 90, normalLow: 90, normalHigh: 120 },
  sodium_meq_l: { min: 110, max: 165, unit: 'mEq/L', label: 'Sodium', criticalLow: 120, low: 130, normalLow: 130, normalHigh: 145, high: 155, criticalHigh: 155 },
  potassium_meq_l: { min: 2, max: 7, unit: 'mEq/L', label: 'Potassium', criticalLow: 2.5, low: 3.5, normalLow: 3.5, normalHigh: 5, high: 6, criticalHigh: 6 },
}

export function getRangeConfig(trackName: string, subtypeName: string): RangeConfig | null {
  if (trackName === 'vitals') return VITALS_RANGE_CONFIGS[subtypeName] || null
  if (trackName === 'labs') return LABS_RANGE_CONFIGS[subtypeName] || null
  return null
}

// ============================================
// Status Labels & Narratives
// ============================================

export const STATUS_LABELS: Record<ValueStatus, string> = {
  normal: 'Normal',
  elevated: 'Elevated',
  high: 'High',
  'critical-high': 'Critically high',
  low: 'Low',
  'critical-low': 'Critically Low',
  depressed: 'Depressed',
}

export function getVitalNarrative(subtypeName: string, status: ValueStatus): string {
  switch (subtypeName) {
    case 'hr':
      if (status === 'normal') return 'Heart rate is within normal resting range (50-100 bpm).'
      if (status === 'elevated' || status === 'high') return 'Elevated heart rate may indicate stress, fever, dehydration, or cardiac conditions.'
      if (status === 'critical-high') return 'Critically elevated heart rate requires immediate evaluation for arrhythmia or underlying cause.'
      if (status === 'low') return 'Low heart rate may be normal in athletes or indicate bradycardia requiring evaluation.'
      if (status === 'critical-low') return 'Critically low heart rate may cause symptoms and requires immediate evaluation.'
      break
    case 'bp':
      if (status === 'normal') return 'Within normal range (<120/80 mmHg).'
      if (status === 'elevated') return 'Systolic in the 120–129 mmHg range with diastolic below 80 mmHg.'
      if (status === 'high') return 'Meets hypertension criteria (≥130/80 mmHg).'
      if (status === 'critical-high') return 'Meets hypertensive urgency criteria (≥180/120 mmHg).'
      if (status === 'low') return 'Below normal range (<90/60 mmHg).'
      if (status === 'critical-low') return 'Critically low (hypotension threshold).'
      break
    case 'spo2':
      if (status === 'normal') return 'Oxygen saturation is normal (≥93%).'
      if (status === 'depressed') return 'Oxygen saturation is mildly reduced. Monitor closely.'
      if (status === 'low') return 'Oxygen saturation is low. Supplemental oxygen may be needed.'
      if (status === 'critical-low') return 'Critically low oxygen saturation. Immediate intervention required.'
      break
    case 'temp_c':
      if (status === 'normal') return 'Body temperature is within normal range (36-38°C).'
      if (status === 'elevated') return 'Mild fever detected. Monitor for infection or other causes.'
      if (status === 'high') return 'Significant fever present. Evaluate for infection and consider antipyretics.'
      if (status === 'critical-high') return 'Dangerously high temperature (hyperthermia). Immediate cooling and evaluation needed.'
      if (status === 'low') return 'Below normal temperature. Monitor for hypothermia.'
      if (status === 'critical-low') return 'Critically low temperature (hypothermia). Immediate warming required.'
      break
  }
  return status === 'normal' ? 'Within reference range.' : `Value is ${STATUS_LABELS[status].toLowerCase()} relative to reference range.`
}

export function getLabNarrative(subtypeName: string, status: ValueStatus): string {
  switch (subtypeName) {
    case 'a1c_pct':
      if (status === 'normal') return 'HbA1c is within the reference range.'
      if (status === 'elevated') return 'HbA1c is in the prediabetes range (5.7–6.4%).'
      if (status === 'high') return 'HbA1c is above the diabetes diagnostic threshold (≥6.5%).'
      if (status === 'critical-high') return 'HbA1c is markedly elevated (≥9%).'
      break
    case 'glucose_mg_dl':
      if (status === 'normal') return 'Glucose is within the reference range.'
      if (status === 'elevated') return 'Glucose is elevated.'
      if (status === 'high' || status === 'critical-high') return 'Glucose is markedly elevated.'
      if (status === 'low') return 'Glucose is low.'
      if (status === 'critical-low') return 'Glucose is critically low.'
      break
    case 'ldl_mg_dl':
      if (status === 'normal') return 'LDL cholesterol is at optimal level (<100 mg/dL).'
      if (status === 'elevated') return 'LDL cholesterol is mildly elevated. Consider dietary changes.'
      if (status === 'high' || status === 'critical-high') return 'LDL cholesterol is significantly elevated. Statin therapy may be indicated.'
      break
    case 'creatinine_mg_dl':
      if (status === 'normal') return 'Creatinine is within the reference range.'
      if (status === 'elevated') return 'Creatinine is mildly elevated.'
      if (status === 'high' || status === 'critical-high') return 'Creatinine is elevated.'
      break
    case 'bun_mg_dl':
      if (status === 'normal') return 'BUN is within the reference range.'
      if (status === 'low') return 'BUN is low.'
      if (status === 'elevated') return 'BUN is mildly elevated.'
      if (status === 'high' || status === 'critical-high') return 'BUN is elevated.'
      break
    case 'efgr_ml_min':
      if (status === 'normal') return 'eGFR is within the reference range.'
      if (status === 'depressed') return 'eGFR is mildly reduced.'
      if (status === 'low') return 'eGFR is moderately reduced.'
      if (status === 'critical-low') return 'eGFR is severely reduced.'
      break
    case 'tsh_miu_l':
      if (status === 'normal') return 'TSH is within normal range, indicating euthyroid state.'
      if (status === 'elevated' || status === 'high' || status === 'critical-high') return 'TSH is elevated, suggesting hypothyroidism. Thyroid hormone replacement may be needed.'
      if (status === 'low' || status === 'critical-low') return 'TSH is suppressed, suggesting hyperthyroidism. Further evaluation needed.'
      break
    case 'potassium_meq_l':
      if (status === 'normal') return 'Potassium is within normal range.'
      if (status === 'high' || status === 'critical-high') return 'Potassium is elevated (hyperkalemia). May affect cardiac function. Evaluate medications and kidney function.'
      if (status === 'low' || status === 'critical-low') return 'Potassium is low (hypokalemia). May cause muscle weakness or arrhythmias.'
      break
    case 'sodium_meq_l':
      if (status === 'normal') return 'Sodium is within normal range.'
      if (status === 'high' || status === 'critical-high') return 'Sodium is elevated (hypernatremia). Evaluate fluid status and intake.'
      if (status === 'low' || status === 'critical-low') return 'Sodium is low (hyponatremia). Evaluate fluid status and medications.'
      break
  }
  return status === 'normal' ? 'Within reference range.' : `Value is ${STATUS_LABELS[status].toLowerCase()} relative to reference range.`
}
