import { PatientData } from '../utils/types'

interface DomainSidebarProps {
  patientData: PatientData
  onRowHover?: (trackName: string, subtypeName: string) => void
  onRowLeave?: () => void
}

const DomainSidebar = ({ patientData, onRowHover, onRowLeave }: DomainSidebarProps) => {
  const trackOrder = patientData.domainConfig.defaultTrackOrder

  return (
    <div className="domain-sidebar">
      {trackOrder.map((trackName) => {
        const trackConfig = patientData.domainConfig.tracks[trackName]
        if (!trackConfig) return null

        const displayTrackName = trackName.charAt(0).toUpperCase() + trackName.slice(1).toUpperCase()

        return (
          <div key={trackName} className="domain-section">
            <div className="domain-header">
              {displayTrackName}
            </div>
            {/* ENCOUNTERS is ONE ROW - show empty row with matching height for alignment */}
            {trackName === 'encounters' ? (
              <div className="domain-subtype domain-subtype-encounter" style={{ visibility: 'hidden', height: '48px', minHeight: '48px' }}>
                {/* Empty row for alignment with encounter cells */}
              </div>
            ) : (
              trackConfig.subtypes.map((subtype) => {
                const displaySubtypeName = subtype.charAt(0).toUpperCase() + subtype.slice(1).replace(/_/g, ' ')
                return (
                  <div 
                    key={`${trackName}-${subtype}`} 
                    className="domain-subtype"
                    onMouseEnter={() => onRowHover?.(trackName, subtype)}
                    onMouseLeave={() => onRowLeave?.()}
                  >
                    {displaySubtypeName}
                  </div>
                )
              })
            )}
          </div>
        )
      })}
    </div>
  )
}

export default DomainSidebar
