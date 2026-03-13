import { useRef, useEffect } from 'react'
import { TimelineSettingsState } from '../utils/types'

interface TimelineSettingsProps {
  isOpen: boolean
  onClose: () => void
  settings: TimelineSettingsState
  onSettingsChange: (settings: TimelineSettingsState) => void
}

const TimelineSettings = ({ isOpen, onClose, settings, onSettingsChange }: TimelineSettingsProps) => {
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) onClose()
    }
    if (isOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, onClose])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const toggleTrack = (trackKey: string) => {
    onSettingsChange({
      ...settings,
      visibleTracks: {
        ...settings.visibleTracks,
        [trackKey]: !settings.visibleTracks[trackKey],
      },
    })
  }

  const toggleOption = (key: 'showGaps') => {
    onSettingsChange({ ...settings, [key]: !settings[key] })
  }

  const trackToggles = [
    { key: 'patient_reported', label: 'Patient Reported' },
    { key: 'diagnoses', label: 'Diagnoses' },
    { key: 'encounters', label: 'Encounters' },
    { key: 'vitals', label: 'Vitals' },
    { key: 'labs', label: 'Labs' },
  ]

  return (
    <div className="settings-modal-overlay">
      <div className="settings-modal" ref={modalRef}>
        <div className="settings-modal-header">
          <h3 className="settings-modal-title">Timeline Settings</h3>
          <button className="settings-modal-close" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="settings-modal-content">
          <div className="settings-section">
            <div className="settings-section-title">Track Visibility</div>
            <div className="settings-toggles">
              {trackToggles.map(({ key, label }) => (
                <label key={key} className="settings-toggle-item">
                  <input
                    type="checkbox"
                    checked={settings.visibleTracks[key] ?? true}
                    onChange={() => toggleTrack(key)}
                  />
                  <span className="toggle-switch" />
                  <span className="toggle-label">{label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="settings-section">
            <div className="settings-section-title">Display Options</div>
            <div className="settings-toggles">
              <label className="settings-toggle-item">
                <input
                  type="checkbox"
                  checked={settings.showGaps}
                  onChange={() => toggleOption('showGaps')}
                />
                <span className="toggle-switch" />
                <span className="toggle-label">Show Gap Segments</span>
              </label>
            </div>
          </div>

          <div className="settings-section">
            <div className="settings-section-title">Export</div>
            <div className="settings-export-buttons">
              <button className="export-button" onClick={() => alert('CSV export coming soon')}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Export CSV
              </button>
              <button className="export-button" onClick={() => alert('PDF export coming soon')}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Export PDF
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TimelineSettings
