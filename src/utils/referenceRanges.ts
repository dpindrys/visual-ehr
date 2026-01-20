// Reference ranges and status evaluation for vitals and labs

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
  // Critically high
  if (systolic >= 180 || diastolic >= 120) return 'critical-high'
  // Critically low
  if (systolic < 80 || diastolic < 50) return 'critical-low'
  // Low
  if (systolic < 90 || diastolic < 60) return 'low'
  // High
  if (systolic >= 130 || diastolic >= 80) return 'high'
  // Elevated (systolic 120-129 with diastolic <80)
  if (systolic >= 120 && diastolic < 80) return 'elevated'
  // Normal
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
    case 'hr':
      return getHeartRateStatus(value)
    case 'bp':
      // value = systolic, value2 = diastolic
      return getBloodPressureStatus(value, value2 ?? 80)
    case 'spo2':
      return getSpO2Status(value)
    case 'temp_c':
      return getTemperatureStatus(value)
    default:
      return 'normal'
  }
}

export function getLabStatus(labType: string, value: number): ValueStatus {
  switch (labType) {
    case 'a1c_pct':
      return getA1cStatus(value)
    case 'glucose_mg_dl':
      return getGlucoseStatus(value)
    case 'ldl_mg_dl':
      return getLdlStatus(value)
    case 'triglycerides_mg_dl':
      return getTriglyceridesStatus(value)
    case 'creatinine_mg_dl':
      return getCreatinineStatus(value)
    case 'bun_mg_dl':
      return getBunStatus(value)
    case 'tsh_miu_l':
      return getTshStatus(value)
    case 'efgr_ml_min':
      return getEgfrStatus(value)
    case 'sodium_meq_l':
      return getSodiumStatus(value)
    case 'potassium_meq_l':
      return getPotassiumStatus(value)
    default:
      return 'normal'
  }
}
