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

  const sexLabel =
    patient.sex === 'M' ? 'Male' : patient.sex === 'F' ? 'Female' : patient.sex || '—'

  const getAllergySeverityClass = (severity: string): string => {
    switch (severity) {
      case 'severe':
        return 'allergy-severe'
      case 'moderate':
        return 'allergy-moderate'
      case 'mild':
        return 'allergy-mild'
      default:
        return 'allergy-moderate'
    }
  }

  const allergyCount =
    patient.allergies?.length ?? patient.summary.allergies.length ?? 0

  return (
    <div className="patient-rail">
      <div className="patient-rail-hero">
        <div className="patient-avatar">{getInitials(patient.name)}</div>
        <div className="patient-name-block">
          <div className="patient-name">{patient.name}</div>
          <div className="patient-age-sex">
            {age} · {sexLabel}
          </div>
        </div>
      </div>

      <div className="patient-rail-block">
        <div className="patient-rail-block-header">Identifiers &amp; vitals</div>
        <div className="patient-rail-rows">
          <div className="patient-rail-row">
            <span className="patient-rail-label">MRN</span>
            <span className="patient-rail-value">{patient.mrn}</span>
          </div>
          <div className="patient-rail-row">
            <span className="patient-rail-label">DOB</span>
            <span className="patient-rail-value">{formatDate(patient.dob)}</span>
          </div>
          <div className="patient-rail-row">
            <span className="patient-rail-label">Sex</span>
            <span className="patient-rail-value">{sexLabel}</span>
          </div>
          {patient.height ? (
            <div className="patient-rail-row">
              <span className="patient-rail-label">Ht</span>
              <span className="patient-rail-value">{patient.height}</span>
            </div>
          ) : null}
          {patient.weight ? (
            <div className="patient-rail-row">
              <span className="patient-rail-label">Wt</span>
              <span className="patient-rail-value">{patient.weight}</span>
            </div>
          ) : null}
          {patient.bmi != null ? (
            <div className="patient-rail-row">
              <span className="patient-rail-label">BMI</span>
              <span className="patient-rail-value">{patient.bmi.toFixed(1)}</span>
            </div>
          ) : null}
        </div>
      </div>

      <div className="patient-rail-block">
        <div className="patient-rail-block-header">
          Allergies
          {allergyCount > 0 ? (
            <span className="patient-rail-block-header-count"> ({allergyCount})</span>
          ) : null}
        </div>
        <div className="patient-rail-rows patient-rail-rows--allergies">
          {patient.allergies && patient.allergies.length > 0 ? (
            patient.allergies.map((allergy, i) => (
              <div key={i} className="patient-rail-row patient-rail-row--allergy">
                <span className="patient-rail-value patient-rail-value--truncate">{allergy.name}</span>
                <span className={`allergy-reaction ${getAllergySeverityClass(allergy.severity)}`}>
                  {allergy.reaction}
                </span>
              </div>
            ))
          ) : patient.summary.allergies.length > 0 ? (
            patient.summary.allergies.map((allergy, i) => (
              <div key={i} className="patient-rail-row patient-rail-row--simple-allergy">
                <span className="patient-rail-value">{allergy}</span>
              </div>
            ))
          ) : (
            <div className="patient-rail-row patient-rail-row--empty">
              <span className="patient-rail-muted">None known</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PatientRail
