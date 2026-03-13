import { PatientInfo } from '../utils/types'
import { formatDate } from '../utils/helpers'

interface PatientRailProps {
  patient: PatientInfo
}

const PatientRail = ({ patient }: PatientRailProps) => {
  const birthDate = new Date(patient.dob)
  const age = patient.age ?? new Date().getFullYear() - birthDate.getFullYear()

  const getInitials = (name: string): string =>
    name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)

  const getAllergySeverityClass = (severity: string): string => {
    switch (severity) {
      case 'severe': return 'allergy-severe'
      case 'moderate': return 'allergy-moderate'
      case 'mild': return 'allergy-mild'
      default: return 'allergy-moderate'
    }
  }

  return (
    <div className="patient-rail">
      <div className="patient-avatar-section">
        <div className="patient-avatar">{getInitials(patient.name)}</div>
        <div className="patient-name-block">
          <div className="patient-name">{patient.name}</div>
          <div className="patient-age-sex">
            {age} {patient.sex === 'M' ? 'Male' : patient.sex === 'F' ? 'Female' : patient.sex}
          </div>
        </div>
      </div>

      <div className="patient-section">
        <div className="patient-info-row">
          <span className="info-label">MRN:</span>
          <span className="info-value">{patient.mrn}</span>
        </div>
        <div className="patient-info-row">
          <span className="info-label">DOB:</span>
          <span className="info-value">{formatDate(patient.dob)}</span>
        </div>
        {patient.height && (
          <div className="patient-info-row">
            <span className="info-label">Ht:</span>
            <span className="info-value">{patient.height}</span>
          </div>
        )}
        {patient.weight && (
          <div className="patient-info-row">
            <span className="info-label">Wt:</span>
            <span className="info-value">{patient.weight}</span>
          </div>
        )}
        {patient.bmi && (
          <div className="patient-info-row">
            <span className="info-label">BMI:</span>
            <span className="info-value">{patient.bmi.toFixed(1)}</span>
          </div>
        )}
      </div>

      <div className="patient-section">
        <div className="section-header">
          Allergies{' '}
          {patient.allergies && (
            <span className="section-count">({patient.allergies.length})</span>
          )}
        </div>
        <div className="allergies-list">
          {patient.allergies && patient.allergies.length > 0 ? (
            patient.allergies.map((allergy, i) => (
              <div key={i} className="allergy-item">
                <span className="allergy-name">{allergy.name}</span>
                <span className={`allergy-reaction ${getAllergySeverityClass(allergy.severity)}`}>
                  {allergy.reaction}
                </span>
              </div>
            ))
          ) : patient.summary.allergies.length > 0 ? (
            patient.summary.allergies.map((allergy, i) => (
              <div key={i} className="allergy-item-simple">
                <span className="allergy-warning">⚠</span> {allergy}
              </div>
            ))
          ) : (
            <div className="no-data">None known</div>
          )}
        </div>
      </div>

      <div className="patient-section">
        <div className="patient-info-row">
          <span className="info-label">MRN:</span>
          <span className="info-value">{patient.mrn}</span>
        </div>
        <div className="patient-info-row">
          <span className="info-label">DOB:</span>
          <span className="info-value">{formatDate(patient.dob)}</span>
        </div>
        <div className="patient-info-row">
          <span className="info-label">Ht:</span>
          <span className="info-value">{patient.height ?? '—'}</span>
        </div>
        <div className="patient-info-row">
          <span className="info-label">Wt:</span>
          <span className="info-value">{patient.weight ?? '—'}</span>
        </div>
        <div className="patient-info-row">
          <span className="info-label">BMI:</span>
          <span className="info-value">{patient.bmi != null ? patient.bmi.toFixed(1) : '—'}</span>
        </div>
      </div>
    </div>
  )
}

export default PatientRail
