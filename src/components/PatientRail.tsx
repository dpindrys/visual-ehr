import { formatDate } from '../utils/helpers'

interface PatientInfo {
  name: string
  dob: string
  mrn: string
  summary: {
    allergies: string[]
    careTeam: string[]
    problemsAtAGlance: string[]
  }
}

interface PatientRailProps {
  patient: PatientInfo
}

const PatientRail = ({ patient }: PatientRailProps) => {
  const birthDate = new Date(patient.dob)
  const age = new Date().getFullYear() - birthDate.getFullYear()

  return (
    <div className="patient-rail">
      <div className="patient-rail-header">{patient.name}</div>
      <div className="patient-rail-info">
        <strong>Age:</strong> {age}
      </div>
      <div className="patient-rail-info">
        <strong>DOB:</strong> {formatDate(patient.dob)}
      </div>
      <div className="patient-rail-info">
        <strong>MRN:</strong> {patient.mrn}
      </div>

      <div style={{ marginTop: '16px' }}>
        <div className="patient-rail-header" style={{ fontSize: '12px' }}>
          Active Problems
        </div>
        <div className="patient-rail-info" style={{ fontSize: '12px' }}>
          {patient.summary.problemsAtAGlance.map((prob) => (
            <div key={prob} style={{ marginBottom: '4px' }}>
              • {prob}
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: '16px' }}>
        <div className="patient-rail-header" style={{ fontSize: '12px' }}>
          Allergies
        </div>
        <div className="patient-rail-info" style={{ fontSize: '12px' }}>
          {patient.summary.allergies.length > 0
            ? patient.summary.allergies.map((allergy) => (
                <div key={allergy} style={{ color: '#dc2626', marginBottom: '4px' }}>
                  ⚠ {allergy}
                </div>
              ))
            : 'None known'}
        </div>
      </div>
    </div>
  )
}

export default PatientRail
