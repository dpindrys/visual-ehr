import { PatientInfo } from '../utils/types'
import { formatDate } from '../utils/helpers'

interface PatientRailProps {
  patient: PatientInfo
}

function getPcpName(patient: PatientInfo): string {
  const team = patient.careTeam
  if (!team?.length) return '—'
  const pcp = team.find(
    (m) => /^pcp$/i.test(m.role.trim()) || /primary\s*care/i.test(m.role)
  )
  return pcp?.name ?? '—'
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

  const pcpName = getPcpName(patient)
  const language = patient.language?.trim() || '—'
  const smoking = patient.smokingStatus?.trim() || '—'

  const renderAllergiesValue = () => {
    if (patient.allergies && patient.allergies.length > 0) {
      return (
        <div className="patient-rail-value-stack">
          {patient.allergies.map((allergy, i) => (
            <div key={i} className="patient-rail-allergy-line">
              <span className="patient-rail-allergy-name">{allergy.name}</span>
              <span className={`allergy-reaction ${getAllergySeverityClass(allergy.severity)}`}>
                {allergy.reaction}
              </span>
            </div>
          ))}
        </div>
      )
    }
    if (patient.summary.allergies.length > 0) {
      return (
        <div className="patient-rail-value-stack">
          {patient.summary.allergies.map((a, i) => (
            <span key={i} className="patient-rail-value patient-rail-value--simple-allergy">
              {a}
            </span>
          ))}
        </div>
      )
    }
    return <span className="patient-rail-muted">None known</span>
  }

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

      <div className="patient-rail-body">
        <section className="patient-rail-group" aria-labelledby="patient-rail-id-demo">
          <header className="patient-rail-section-head">
            <h2 className="patient-rail-section-title" id="patient-rail-id-demo">
              Identifiers &amp; Demographics
            </h2>
            <div className="patient-rail-section-rule" aria-hidden />
          </header>
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
            <div className="patient-rail-row">
              <span className="patient-rail-label">Language</span>
              <span className="patient-rail-value">{language}</span>
            </div>
          </div>
        </section>

        {(patient.height || patient.weight || patient.bmi != null) && (
          <section className="patient-rail-group" aria-labelledby="patient-rail-body-metrics">
            <header className="patient-rail-section-head">
              <h2 className="patient-rail-section-title" id="patient-rail-body-metrics">
                Body Metrics
              </h2>
              <div className="patient-rail-section-rule" aria-hidden />
            </header>
            <div className="patient-rail-rows">
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
          </section>
        )}

        <section className="patient-rail-group" aria-labelledby="patient-rail-care">
          <header className="patient-rail-section-head">
            <h2 className="patient-rail-section-title" id="patient-rail-care">
              Care Context
            </h2>
            <div className="patient-rail-section-rule" aria-hidden />
          </header>
          <div className="patient-rail-rows">
            <div className="patient-rail-row patient-rail-row--align-top">
              <span className="patient-rail-label">Allergies</span>
              <div className="patient-rail-value patient-rail-value--block">{renderAllergiesValue()}</div>
            </div>
            <div className="patient-rail-row">
              <span className="patient-rail-label">Smoking</span>
              <span className="patient-rail-value">{smoking}</span>
            </div>
            <div className="patient-rail-row">
              <span className="patient-rail-label">PCP</span>
              <span className="patient-rail-value">{pcpName}</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default PatientRail
