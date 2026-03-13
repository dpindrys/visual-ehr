import { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import { PatientData, Segment, NavTab, TimelineSettingsState } from '../utils/types'
import { generateSegmentArray } from '../utils/segmentArray'
import { getGapWidth, formatTabDate } from '../utils/helpers'
import { computeDiagnosisPeriods } from '../utils/continuousStateEngine'
import TrackStack from './TrackStack'
import ClinicalSummaryHeader from './ClinicalSummaryHeader'
import TimelineRuler from './TimelineRuler'
import DomainSidebar from './DomainSidebar'
import TimelineNavTabs from './TimelineNavTabs'
import TimelineSettings from './TimelineSettings'
import AdminBar from './AdminBar'
import PatientRail from './PatientRail'

interface TimelineProps {
  patientData: PatientData
}

const SIDEBAR_WIDTH = 215
const ENCOUNTER_WIDTH = 120

const Timeline = ({ patientData }: TimelineProps) => {
  const [contextHighlightSegmentId, setContextHighlightSegmentId] = useState<string | undefined>()
  const [highlightedRow, setHighlightedRow] = useState<{ trackName: string; subtypeName: string } | null>(null)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [hiddenSubtypes, setHiddenSubtypes] = useState<Set<string>>(new Set())
  const [isPressHeld, setIsPressHeld] = useState(false)
  const [settings, setSettings] = useState<TimelineSettingsState>({
    visibleTracks: {
      patient_reported: true,
      diagnoses: true,
      encounters: true,
      vitals: true,
      labs: true,
    },
    showGaps: true,
  })

  const handleToggleSubtype = useCallback((trackName: string, subtypeName: string) => {
    setHiddenSubtypes((prev) => {
      const key = `${trackName}-${subtypeName}`
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }, [])

  const trackStackRef = useRef<HTMLDivElement>(null)
  const mainAreaRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState<number>(0)
  const [visibleSegmentStart, setVisibleSegmentStart] = useState<number>(-1)
  const [selectedTabIndex, setSelectedTabIndex] = useState<number | null>(null)
  const hasUserNavigated = useRef(false)

  const allSegments: Segment[] = useMemo(() => generateSegmentArray(patientData), [patientData])
  const diagnosisPeriods = useMemo(() => computeDiagnosisPeriods(patientData), [patientData])

  const getSegmentWidth = useCallback(
    (segment: Segment): number =>
      segment.type === 'encounter' ? ENCOUNTER_WIDTH : getGapWidth(segment.durationDays || 0),
    []
  )

  const calculateSegmentCount = useCallback(
    (startIndex: number, availableWidth: number): number => {
      if (availableWidth <= 0 || startIndex < 0 || startIndex >= allSegments.length) return 0
      const maxWidth = availableWidth - SIDEBAR_WIDTH
      let totalWidth = 0
      let count = 0
      for (let i = startIndex; i < allSegments.length; i++) {
        const width = getSegmentWidth(allSegments[i])
        if (totalWidth + width > maxWidth && count > 0) break
        totalWidth += width
        count++
      }
      return Math.max(1, count)
    },
    [allSegments, getSegmentWidth]
  )

  const calculateStartForEnd = useCallback(
    (endIndex: number, availableWidth: number): number => {
      if (availableWidth <= 0 || endIndex < 0 || endIndex >= allSegments.length) return 0
      const maxWidth = availableWidth - SIDEBAR_WIDTH
      let totalWidth = 0
      let startIdx = endIndex
      for (let i = endIndex; i >= 0; i--) {
        const width = getSegmentWidth(allSegments[i])
        if (totalWidth + width > maxWidth && startIdx < endIndex) break
        totalWidth += width
        startIdx = i
      }
      return startIdx
    },
    [allSegments, getSegmentWidth]
  )

  // Build navigation tabs (pages) from right-to-left
  const tabs: NavTab[] = useMemo(() => {
    if (containerWidth === 0) return []
    const segmentsThatFit = calculateSegmentCount(0, containerWidth)
    if (allSegments.length === 0 || segmentsThatFit === 0) return []

    const encounterSegments = allSegments.filter((s) => s.type === 'encounter')
    if (encounterSegments.length === 0) return []

    const encountersThatFit = Math.max(1, Math.floor(segmentsThatFit / 2))
    const tabCount = Math.ceil(encounterSegments.length / encountersThatFit)
    if (tabCount <= 1) return []

    const result: NavTab[] = []
    let lastIdx = encounterSegments.length - 1

    for (let i = 0; i < tabCount && lastIdx >= 0; i++) {
      const endEncIdx = lastIdx
      const startEncIdx = Math.max(0, lastIdx - encountersThatFit + 1)
      const startEnc = encounterSegments[startEncIdx]
      const endEnc = encounterSegments[endEncIdx]
      const startIndex = allSegments.findIndex((s) => s.id === startEnc.id)
      const endIndex = allSegments.findIndex((s) => s.id === endEnc.id)

      result.push({
        startIndex,
        endIndex,
        startDate: formatTabDate(startEnc.label),
        endDate: formatTabDate(endEnc.label),
        encounterCount: endEncIdx - startEncIdx + 1,
      })
      lastIdx = startEncIdx - 1
    }

    result.reverse()
    return result
  }, [allSegments, containerWidth, calculateSegmentCount])

  const activeTabIndex = useMemo(() => {
    if (tabs.length === 0) return 0
    if (selectedTabIndex !== null) return Math.min(selectedTabIndex, tabs.length - 1)
    return tabs.length - 1
  }, [tabs.length, selectedTabIndex])

  // Calculate visible segments
  const visibleSegments: Segment[] = useMemo(() => {
    if (visibleSegmentStart < 0 || containerWidth === 0) return []
    const count = calculateSegmentCount(visibleSegmentStart, containerWidth)
    let result = allSegments.slice(visibleSegmentStart, visibleSegmentStart + count)

    if (!settings.showGaps) {
      result = result.filter((s) => s.type !== 'gap')
    }

    // Trim trailing gaps
    while (result.length > 0 && result[result.length - 1].type === 'gap') {
      result = result.slice(0, -1)
    }

    return result
  }, [allSegments, visibleSegmentStart, containerWidth, calculateSegmentCount, settings.showGaps])

  // Track container width
  useEffect(() => {
    const element = mainAreaRef.current
    if (!element) return
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) setContainerWidth(entry.contentRect.width)
    })
    resizeObserver.observe(element)
    setContainerWidth(element.getBoundingClientRect().width)
    return () => resizeObserver.disconnect()
  }, [])

  // Initialize to most recent tab
  useEffect(() => {
    if (containerWidth !== 0) {
      if (tabs.length > 0 && visibleSegmentStart < 0) {
        const lastTab = tabs[tabs.length - 1]
        const start = calculateStartForEnd(lastTab.endIndex, containerWidth)
        setVisibleSegmentStart(start)
        setSelectedTabIndex(tabs.length - 1)
      } else if (tabs.length === 0 && allSegments.length > 0 && visibleSegmentStart < 0) {
        const lastIdx = allSegments.length - 1
        const start = calculateStartForEnd(lastIdx, containerWidth)
        setVisibleSegmentStart(start)
      }
    }
  }, [tabs, allSegments.length, containerWidth, visibleSegmentStart, calculateStartForEnd])

  // Adjust on resize (only if user hasn't navigated)
  useEffect(() => {
    if (containerWidth > 0 && visibleSegmentStart >= 0 && !hasUserNavigated.current && allSegments.length > 0) {
      if (tabs.length > 0) {
        const lastTab = tabs[tabs.length - 1]
        const start = calculateStartForEnd(lastTab.endIndex, containerWidth)
        if (start !== visibleSegmentStart) setVisibleSegmentStart(start)
      } else {
        const lastIdx = allSegments.length - 1
        const start = calculateStartForEnd(lastIdx, containerWidth)
        if (start !== visibleSegmentStart) setVisibleSegmentStart(start)
      }
    }
  }, [containerWidth, visibleSegmentStart, tabs, allSegments.length, calculateStartForEnd])

  const handleTabClick = (endIndex: number, tabIndex: number) => {
    const start = calculateStartForEnd(endIndex, containerWidth)
    setVisibleSegmentStart(start)
    setSelectedTabIndex(tabIndex)
    hasUserNavigated.current = true
  }

  return (
    <div className="timeline-content">
      {/* Top Navigation Bar */}
      <div className="top-nav-bar">
        <div className="timeline-nav-controls">
          <span className="nav-info">
            <span className="nav-patient-name">{patientData.patient.name}</span>
            <span className="nav-separator">•</span>
            <span className="nav-detail">{patientData.patient.age}yo {patientData.patient.sex}</span>
            <span className="nav-separator">•</span>
            <span className="nav-detail">DOB: {patientData.patient.dob}</span>
            <span className="nav-separator">•</span>
            <span className="nav-detail">MRN: {patientData.patient.mrn}</span>
            <span className="nav-separator">•</span>
            <span className="nav-detail">
              {allSegments.filter((s) => s.type === 'encounter').length} encounters
            </span>
            {patientData.patient.allergies && patientData.patient.allergies.length > 0 && (
              <>
                <span className="nav-separator">•</span>
                <span className="nav-allergy">
                  ⚠ {patientData.patient.allergies.map((a) => a.name).join(', ')}
                </span>
              </>
            )}
          </span>
        </div>
      </div>

      {/* Main Timeline Area */}
      <div ref={mainAreaRef} className="timeline-main-area">
        <div className="timeline-scrollable-area">
          {/* Summary Unit */}
          <div className="summary-unit">
            <ClinicalSummaryHeader segments={allSegments} />
            <PatientRail patient={patientData.patient} />
          </div>

          {/* Admin Bar */}
          <AdminBar patient={patientData.patient} />

          {/* Timeline Unit (grid + sidebar) */}
          <div className="timeline-unit">
            <div className="timeline-grid-container">
              <TrackStack
                ref={trackStackRef}
                patientData={patientData}
                segments={visibleSegments}
                onContextHighlight={setContextHighlightSegmentId}
                contextHighlightSegmentId={contextHighlightSegmentId}
                highlightedRow={highlightedRow}
                visibleTracks={settings.visibleTracks}
                hiddenSubtypes={hiddenSubtypes}
                isPressHeld={isPressHeld}
              />
            </div>
            <DomainSidebar
              patientData={patientData}
              diagnosisPeriods={diagnosisPeriods}
              onRowHover={(trackName, subtypeName) => setHighlightedRow({ trackName, subtypeName })}
              onRowLeave={() => {
                setHighlightedRow(null)
                setIsPressHeld(false)
              }}
              onPressHeldChange={setIsPressHeld}
              visibleTracks={settings.visibleTracks}
              hiddenSubtypes={hiddenSubtypes}
              onToggleSubtype={handleToggleSubtype}
            />
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="timeline-bottom-bar">
        <div className="timeline-bottom-rows">
          <div className="timeline-ruler-row">
            <TimelineRuler
              segments={visibleSegments}
              contextHighlightSegmentId={contextHighlightSegmentId}
              onContextHighlight={setContextHighlightSegmentId}
            />
          </div>
          <TimelineNavTabs tabs={tabs} activeTabIndex={activeTabIndex} onTabClick={handleTabClick} />
        </div>

        <button
          className="settings-button"
          onClick={() => setIsSettingsOpen(true)}
          title="Timeline Settings"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 15.5A3.5 3.5 0 0 1 8.5 12 3.5 3.5 0 0 1 12 8.5a3.5 3.5 0 0 1 3.5 3.5 3.5 3.5 0 0 1-3.5 3.5m7.43-2.53c.04-.32.07-.64.07-.97 0-.33-.03-.66-.07-1l2.11-1.63c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.31-.61-.22l-2.49 1c-.52-.39-1.06-.73-1.69-.98l-.37-2.65A.506.506 0 0 0 14 2h-4c-.25 0-.46.18-.5.42l-.37 2.65c-.63.25-1.17.59-1.69.98l-2.49-1c-.22-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64L4.57 11c-.04.34-.07.67-.07 1 0 .33.03.65.07.97l-2.11 1.66c-.19.15-.25.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1.01c.52.4 1.06.74 1.69.99l.37 2.65c.04.24.25.42.5.42h4c.25 0 .46-.18.5-.42l.37-2.65c.63-.26 1.17-.59 1.69-.99l2.49 1.01c.22.08.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.66z" />
          </svg>
          <span>Timeline Settings</span>
        </button>
      </div>

      {/* Settings Modal */}
      <TimelineSettings
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSettingsChange={setSettings}
      />
    </div>
  )
}

export default Timeline
