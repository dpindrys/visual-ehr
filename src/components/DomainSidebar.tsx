import { useState, useMemo, useRef, useEffect } from 'react'
import { PatientData, DiagnosisPeriod, MedicationPeriod, VisibleTracks } from '../utils/types'
import { getRangeConfig } from '../utils/referenceRanges'
import { filterDiagnosisBySubtype, filterMedicationsBySubtype, computeMedicationPeriods } from '../utils/continuousStateEngine'
import Tooltip from './Tooltip'

const EyeIcon = ({ isVisible }: { isVisible: boolean }) => (
  <svg
    width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    className={`subtype-eye-icon ${isVisible ? '' : 'closed'}`}
  >
    {isVisible ? (
      <>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ) : (
      <>
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </>
    )}
  </svg>
)

interface DomainSidebarProps {
  patientData: PatientData
  diagnosisPeriods?: DiagnosisPeriod[]
  onRowHover?: (trackName: string, subtypeName: string) => void
  onRowLeave?: () => void
  onPressHeldChange?: (held: boolean) => void
  visibleTracks?: VisibleTracks
  hiddenSubtypes?: Set<string>
  onToggleSubtype?: (trackName: string, subtypeName: string) => void
}

const DomainSidebar = ({
  patientData,
  diagnosisPeriods = [],
  onRowHover,
  onRowLeave,
  onPressHeldChange,
  visibleTracks = {
    patient_reported: true,
    diagnoses: true,
    encounters: true,
    vitals: true,
    labs: true,
  },
  hiddenSubtypes = new Set(),
  onToggleSubtype,
}: DomainSidebarProps) => {
  const [sidebarTooltip, setSidebarTooltip] = useState<{
    isVisible: boolean
    trackName: string
    subtypeName: string
    x: number
    y: number
    config?: ReturnType<typeof getRangeConfig>
    diagnosisPeriods?: DiagnosisPeriod[]
    medicationPeriods?: MedicationPeriod[]
  }>({ isVisible: false, trackName: '', subtypeName: '', x: 0, y: 0 })

  const [isPressed, setIsPressed] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!openDropdown) return
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [openDropdown])

  const hiddenByTrack = useMemo(() => {
    const map: Record<string, string[]> = {}
    hiddenSubtypes.forEach((key) => {
      const dashIdx = key.indexOf('-')
      if (dashIdx === -1) return
      const track = key.slice(0, dashIdx)
      const sub = key.slice(dashIdx + 1)
      ;(map[track] || (map[track] = [])).push(sub)
    })
    return map
  }, [hiddenSubtypes])

  const medicationPeriods = useMemo(() => computeMedicationPeriods(patientData), [patientData])

  const trackOrder = patientData.domainConfig.defaultTrackOrder.filter(
    (track) => visibleTracks[track] !== false
  )

  const handlePressStart = (e: React.MouseEvent, trackName: string, subtypeName: string) => {
    e.preventDefault()
    setIsPressed(true)
    onPressHeldChange?.(true)

    const rect = (e.target as HTMLElement).getBoundingClientRect()
    let config = null
    let dxPeriods: DiagnosisPeriod[] = []
    let medPeriods: MedicationPeriod[] = []

    if (trackName === 'vitals' || trackName === 'labs') {
      config = getRangeConfig(trackName, subtypeName === 'bp' ? 'bp_sys' : subtypeName)
    } else if (trackName === 'diagnoses') {
      dxPeriods = filterDiagnosisBySubtype(diagnosisPeriods, subtypeName)
    } else if (trackName === 'medications') {
      medPeriods = filterMedicationsBySubtype(medicationPeriods, subtypeName)
    }

    setSidebarTooltip({
      isVisible: true,
      trackName,
      subtypeName,
      x: rect.left,
      y: rect.top + rect.height / 2,
      config,
      diagnosisPeriods: dxPeriods,
      medicationPeriods: medPeriods,
    })
  }

  const handlePressEnd = () => {
    setIsPressed(false)
    onPressHeldChange?.(false)
    setSidebarTooltip((prev) => ({ ...prev, isVisible: false }))
  }

  const getTooltipType = (trackName: string): string | null => {
    if (trackName === 'vitals' || trackName === 'labs') return 'reference'
    if (trackName === 'diagnoses') return 'sidebar-diagnosis'
    if (trackName === 'medications') return 'sidebar-medication'
    if (trackName === 'patient_reported') return 'sidebar-pro'
    return null
  }

  return (
    <div className="domain-sidebar">
      {trackOrder.map((trackName) => {
        const trackConfig = patientData.domainConfig.tracks[trackName]
        if (!trackConfig) return null

        const displayName = trackName === 'patient_reported'
          ? 'PATIENT REPORTED'
          : trackName.charAt(0).toUpperCase() + trackName.slice(1).toUpperCase()

        const hiddenItems = hiddenByTrack[trackName] || []
        const hasHidden = hiddenItems.length > 0
        const isDropdownOpen = openDropdown === trackName

        return (
          <div key={trackName} className="domain-section">
            <div className="domain-header">
              <span>{displayName}</span>
              {hasHidden && (
                <div
                  className="domain-header-hidden-toggle"
                  ref={isDropdownOpen ? dropdownRef : undefined}
                >
                  <button
                    className="hidden-toggle-button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setOpenDropdown(isDropdownOpen ? null : trackName)
                    }}
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M7 10l5 5 5-5z" />
                    </svg>
                    <span className="hidden-count">{hiddenItems.length} hidden</span>
                  </button>
                  {isDropdownOpen && (
                    <div className="hidden-subtypes-dropdown">
                      {hiddenItems.map((sub) => {
                        const label = sub.charAt(0).toUpperCase() + sub.slice(1).replace(/_/g, ' ')
                        return (
                          <button
                            key={sub}
                            className="hidden-subtypes-dropdown-item"
                            onClick={(e) => {
                              e.stopPropagation()
                              onToggleSubtype?.(trackName, sub)
                              if (hiddenItems.length <= 1) setOpenDropdown(null)
                            }}
                          >
                            <EyeIcon isVisible={false} />
                            <span>{label}</span>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            {trackName === 'encounters' ? (
              <div
                className="domain-subtype domain-subtype-encounter"
                style={{ visibility: 'hidden', height: '48px', minHeight: '48px' }}
              />
            ) : (
              trackConfig.subtypes.map((subtype) => {
                const isHidden = hiddenSubtypes.has(`${trackName}-${subtype}`)
                if (isHidden) return null

                const displaySubtypeName =
                  subtype.charAt(0).toUpperCase() + subtype.slice(1).replace(/_/g, ' ')

                const hasTooltip =
                  trackName === 'vitals' || trackName === 'labs' ||
                  trackName === 'diagnoses' || trackName === 'medications' ||
                  trackName === 'patient_reported'

                return (
                  <div
                    key={`${trackName}-${subtype}`}
                    className={`domain-subtype ${hasTooltip ? 'has-tooltip' : ''} ${
                      isPressed && sidebarTooltip.trackName === trackName && sidebarTooltip.subtypeName === subtype ? 'press-held' : ''
                    } ${isHidden ? 'subtype-hidden' : ''}`}
                    onMouseEnter={() => onRowHover?.(trackName, subtype)}
                    onMouseLeave={() => {
                      onRowLeave?.()
                      handlePressEnd()
                    }}
                    onMouseDown={hasTooltip ? (e) => handlePressStart(e, trackName, subtype) : undefined}
                    onMouseUp={hasTooltip ? handlePressEnd : undefined}
                  >
                    <span className="subtype-label-text">{displaySubtypeName}</span>
                    <span
                      className="subtype-eye-toggle"
                      onClick={(e) => {
                        e.stopPropagation()
                        onToggleSubtype?.(trackName, subtype)
                      }}
                      onMouseDown={(e) => e.stopPropagation()}
                    >
                      <EyeIcon isVisible={!isHidden} />
                    </span>
                  </div>
                )
              })
            )}
          </div>
        )
      })}

      {sidebarTooltip.isVisible && (() => {
        const tooltipType = getTooltipType(sidebarTooltip.trackName)
        if (!tooltipType) return null

        if (tooltipType === 'reference' && sidebarTooltip.config) {
          return (
            <Tooltip
              type="reference"
              config={sidebarTooltip.config}
              trackName={sidebarTooltip.trackName}
              x={sidebarTooltip.x}
              y={sidebarTooltip.y}
              position="left"
            />
          )
        }
        if (tooltipType === 'sidebar-diagnosis' && sidebarTooltip.diagnosisPeriods && sidebarTooltip.diagnosisPeriods.length > 0) {
          return (
            <Tooltip
              type="sidebar-diagnosis"
              diagnosisPeriods={sidebarTooltip.diagnosisPeriods}
              x={sidebarTooltip.x}
              y={sidebarTooltip.y}
              position="left"
            />
          )
        }
        if (tooltipType === 'sidebar-medication' && sidebarTooltip.medicationPeriods && sidebarTooltip.medicationPeriods.length > 0) {
          return (
            <Tooltip
              type="sidebar-medication"
              medicationPeriods={sidebarTooltip.medicationPeriods}
              x={sidebarTooltip.x}
              y={sidebarTooltip.y}
              position="left"
            />
          )
        }
        if (tooltipType === 'sidebar-pro') {
          return (
            <Tooltip
              type="sidebar-pro"
              subtypeName={sidebarTooltip.subtypeName}
              patientReportedEntries={patientData.patientReported || []}
              x={sidebarTooltip.x}
              y={sidebarTooltip.y}
              position="left"
            />
          )
        }
        return null
      })()}
    </div>
  )
}

export default DomainSidebar
