import { PatientInfo } from '../utils/types'

interface AdminBarProps {
  patient: PatientInfo
}

const AdminBar = ({ patient }: AdminBarProps) => {
  const hasCareTeam =
    (patient.careTeam && patient.careTeam.length > 0) ||
    patient.summary.careTeam.length > 0

  const hasContactInfo = patient.phone || patient.language || patient.pharmacy

  if (!hasCareTeam && !hasContactInfo) return null

  return (
    <div className="admin-bar">
      {hasCareTeam && (
        <div className="admin-section">
          <span className="admin-label">Care Team:</span>
          <div className="admin-content">
            {patient.careTeam && patient.careTeam.length > 0
              ? patient.careTeam.map((member, i) => (
                  <span key={i} className="admin-item">
                    <span className="admin-item-role">{member.role}:</span>
                    <span className="admin-item-value">{member.name}</span>
                  </span>
                ))
              : patient.summary.careTeam.map((name, i) => (
                  <span key={i} className="admin-item">{name}</span>
                ))}
          </div>
        </div>
      )}

      {hasCareTeam && hasContactInfo && (
        <span className="admin-separator">|</span>
      )}

      {hasContactInfo && (
        <div className="admin-section">
          {patient.phone && (
            <span className="admin-item">
              <span className="admin-label">Phone:</span>
              <span className="admin-item-value">{patient.phone}</span>
            </span>
          )}
          {patient.language && (
            <span className="admin-item">
              <span className="admin-label">Language:</span>
              <span className="admin-item-value">{patient.language}</span>
            </span>
          )}
          {patient.pharmacy && (
            <span className="admin-item">
              <span className="admin-label">Pharmacy:</span>
              <span className="admin-item-value">{patient.pharmacy}</span>
            </span>
          )}
        </div>
      )}
    </div>
  )
}

export default AdminBar
