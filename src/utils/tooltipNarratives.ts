import { ValueStatus } from './referenceRanges'

export const statusLabels: Record<ValueStatus, string> = {
  normal: 'Normal',
  elevated: 'Elevated',
  high: 'High',
  'critical-high': 'Critically high',
  low: 'Low',
  'critical-low': 'Critically Low',
  depressed: 'Depressed',
}

export function getVitalNarrative(
  subtypeName: string,
  status: ValueStatus,
  _value?: number,
  _value2?: number,
): string {
  switch (subtypeName) {
    case 'hr':
      if (status === 'normal')
        return 'Heart rate is within normal resting range (50-100 bpm).'
      if (status === 'elevated' || status === 'high')
        return 'Elevated heart rate may indicate stress, fever, dehydration, or cardiac conditions.'
      if (status === 'critical-high')
        return 'Critically elevated heart rate requires immediate evaluation for arrhythmia or underlying cause.'
      if (status === 'low')
        return 'Low heart rate may be normal in athletes or indicate bradycardia requiring evaluation.'
      if (status === 'critical-low')
        return 'Critically low heart rate may cause symptoms and requires immediate evaluation.'
      break
    case 'bp':
      if (status === 'normal')
        return 'Blood pressure is within normal range (<120/80 mmHg).'
      if (status === 'elevated')
        return 'Blood pressure is mildly elevated. Lifestyle modifications recommended.'
      if (status === 'high')
        return 'Blood pressure indicates hypertension. Medication and lifestyle changes may be needed.'
      if (status === 'critical-high')
        return 'Blood pressure is dangerously elevated (hypertensive crisis). Immediate medical attention required.'
      if (status === 'low')
        return 'Blood pressure is below normal. May cause dizziness or fatigue.'
      if (status === 'critical-low')
        return 'Critically low blood pressure (hypotension). Requires immediate evaluation.'
      break
    case 'spo2':
      if (status === 'normal')
        return 'Oxygen saturation is normal (≥93%).'
      if (status === 'depressed')
        return 'Oxygen saturation is mildly reduced. Monitor closely.'
      if (status === 'low')
        return 'Oxygen saturation is low. Supplemental oxygen may be needed.'
      if (status === 'critical-low')
        return 'Critically low oxygen saturation. Immediate intervention required.'
      break
    case 'temp_c':
      if (status === 'normal')
        return 'Body temperature is within normal range (36-38°C).'
      if (status === 'elevated')
        return 'Mild fever detected. Monitor for infection or other causes.'
      if (status === 'high')
        return 'Significant fever present. Evaluate for infection and consider antipyretics.'
      if (status === 'critical-high')
        return 'Dangerously high temperature (hyperthermia). Immediate cooling and evaluation needed.'
      if (status === 'low')
        return 'Below normal temperature. Monitor for hypothermia.'
      if (status === 'critical-low')
        return 'Critically low temperature (hypothermia). Immediate warming required.'
      break
  }
  return `Current status: ${statusLabels[status]}.`
}

export function getLabNarrative(
  subtypeName: string,
  status: ValueStatus,
  _value?: number,
): string {
  switch (subtypeName) {
    case 'a1c_pct':
      if (status === 'normal')
        return 'HbA1c indicates good glycemic control over the past 2-3 months.'
      if (status === 'elevated')
        return 'HbA1c indicates prediabetes range. Lifestyle modifications strongly recommended.'
      if (status === 'high' || status === 'critical-high')
        return 'HbA1c indicates diabetes with suboptimal control. Medication adjustment may be needed.'
      break
    case 'glucose_mg_dl':
      if (status === 'normal')
        return 'Blood glucose is within normal fasting range.'
      if (status === 'elevated')
        return 'Blood glucose is elevated. Consider timing relative to meals.'
      if (status === 'high' || status === 'critical-high')
        return 'Blood glucose is significantly elevated. Evaluate diabetes management.'
      if (status === 'low')
        return 'Blood glucose is low. Patient may experience hypoglycemic symptoms.'
      if (status === 'critical-low')
        return 'Critically low blood glucose (hypoglycemia). Immediate treatment required.'
      break
    case 'ldl_mg_dl':
      if (status === 'normal')
        return 'LDL cholesterol is at optimal level (<100 mg/dL).'
      if (status === 'elevated')
        return 'LDL cholesterol is mildly elevated. Consider dietary changes.'
      if (status === 'high' || status === 'critical-high')
        return 'LDL cholesterol is significantly elevated. Statin therapy may be indicated.'
      break
    case 'creatinine_mg_dl':
      if (status === 'normal')
        return 'Creatinine is within normal range, indicating stable kidney function.'
      if (status === 'elevated')
        return 'Creatinine is mildly elevated. May indicate early kidney dysfunction.'
      if (status === 'high' || status === 'critical-high')
        return 'Creatinine is significantly elevated, indicating impaired kidney function.'
      break
    case 'efgr_ml_min':
      if (status === 'normal')
        return 'eGFR indicates normal kidney function (≥90 mL/min).'
      if (status === 'depressed')
        return 'eGFR indicates mildly reduced kidney function (CKD Stage 2).'
      if (status === 'low')
        return 'eGFR indicates moderate kidney disease (CKD Stage 3). Nephrology referral may be needed.'
      if (status === 'critical-low')
        return 'eGFR indicates severe kidney disease (CKD Stage 4-5). Nephrology consultation required.'
      break
    case 'tsh_miu_l':
      if (status === 'normal')
        return 'TSH is within normal range, indicating euthyroid state.'
      if (status === 'elevated' || status === 'high' || status === 'critical-high')
        return 'TSH is elevated, suggesting hypothyroidism. Thyroid hormone replacement may be needed.'
      if (status === 'low' || status === 'critical-low')
        return 'TSH is suppressed, suggesting hyperthyroidism. Further evaluation needed.'
      break
    case 'potassium_meq_l':
      if (status === 'normal')
        return 'Potassium is within normal range.'
      if (status === 'high' || status === 'critical-high')
        return 'Potassium is elevated (hyperkalemia). May affect cardiac function. Evaluate medications and kidney function.'
      if (status === 'low' || status === 'critical-low')
        return 'Potassium is low (hypokalemia). May cause muscle weakness or arrhythmias.'
      break
    case 'sodium_meq_l':
      if (status === 'normal')
        return 'Sodium is within normal range.'
      if (status === 'high' || status === 'critical-high')
        return 'Sodium is elevated (hypernatremia). Evaluate fluid status and intake.'
      if (status === 'low' || status === 'critical-low')
        return 'Sodium is low (hyponatremia). Evaluate fluid status and medications.'
      break
  }
  return `Current status: ${statusLabels[status]}.`
}
