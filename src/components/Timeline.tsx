import { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import { PatientData, Segment } from '../utils/types'
import { generateSegmentArray } from '../utils/segmentArray'
import { getGapWidth } from '../utils/helpers'
import PatientRail from './PatientRail'
import TrackStack from './TrackStack'
import ClinicalSummaryHeader from './ClinicalSummaryHeader'
import TimelineRuler from './TimelineRuler'
import DomainSidebar from './DomainSidebar'
import TimelineNavTabs from './TimelineNavTabs'

interface TimelineProps {
  patientData: PatientData
}

// Constants for width calculations
const SIDEBAR_WIDTH = 215 // sidebar (200px) + scrollbar (~15px)
const ENCOUNTER_WIDTH = 120

const Timeline = ({ patientData }: TimelineProps) => {
  const [contextHighlightSegmentId, setContextHighlightSegmentId] = useState<string | undefined>()
  const [isSummaryCollapsed, setIsSummaryCollapsed] = useState(false)
  const [highlightedRow, setHighlightedRow] = useState<{trackName: string, subtypeName: string} | null>(null)
  const trackStackRef = useRef<HTMLDivElement>(null)
  const mainAreaRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState<number>(0)
  const [visibleSegmentStart, setVisibleSegmentStart] = useState<number>(-1) // -1 = not initialized

  const allSegments: Segment[] = useMemo(() => {
    return generateSegmentArray(patientData)
  }, [patientData])

  // Calculate segment width
  const getSegmentWidth = useCallback((segment: Segment): number => {
    if (segment.type === 'encounter') {
      return ENCOUNTER_WIDTH
    }
    return getGapWidth(segment.durationDays || 0)
  }, [])

  // Calculate how many segments fit starting from a given index
  const calculateSegmentCount = useCallback((startIndex: number, availableWidth: number): number => {
    if (availableWidth <= 0 || startIndex >= allSegments.length) return 0
    
    const maxWidth = availableWidth - SIDEBAR_WIDTH
    let totalWidth = 0
    let count = 0
    
    for (let i = startIndex; i < allSegments.length; i++) {
      const width = getSegmentWidth(allSegments[i])
      if (totalWidth + width > maxWidth && count > 0) break
      totalWidth += width
      count++
    }
    
    return Math.max(1, count) // Always show at least 1 segment
  }, [allSegments, getSegmentWidth])

  // Calculate visible segments dynamically based on container width
  const visibleSegments: Segment[] = useMemo(() => {
    if (visibleSegmentStart < 0 || containerWidth === 0) return []
    
    const count = calculateSegmentCount(visibleSegmentStart, containerWidth)
    return allSegments.slice(visibleSegmentStart, visibleSegmentStart + count)
  }, [allSegments, visibleSegmentStart, containerWidth, calculateSegmentCount])

  // Track container width with ResizeObserver
  useEffect(() => {
    const element = mainAreaRef.current
    if (!element) return

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width)
      }
    })

    resizeObserver.observe(element)
    // Initial measurement
    setContainerWidth(element.getBoundingClientRect().width)

    return () => resizeObserver.disconnect()
  }, [])

  // Initialize to show most recent segments when data loads or container resizes
  useEffect(() => {
    if (allSegments.length > 0 && containerWidth > 0) {
      // Calculate how many segments fit from the end
      const maxWidth = containerWidth - SIDEBAR_WIDTH
      let totalWidth = 0
      let count = 0
      
      // Count backwards from end
      for (let i = allSegments.length - 1; i >= 0; i--) {
        const width = getSegmentWidth(allSegments[i])
        if (totalWidth + width > maxWidth && count > 0) break
        totalWidth += width
        count++
      }
      
      const start = Math.max(0, allSegments.length - count)
      setVisibleSegmentStart(start)
    }
  }, [allSegments.length, containerWidth, getSegmentWidth])

  // Calculate current visible count for navigation
  const currentVisibleCount = visibleSegments.length

  // Navigate backwards in time (show earlier segments)
  const handleGoBack = () => {
    const jumpCount = Math.max(1, currentVisibleCount)
    const newStart = Math.max(0, visibleSegmentStart - jumpCount)
    setVisibleSegmentStart(newStart)
  }

  // Check if we can go back further
  const canGoBack = visibleSegmentStart > 0

  // Check if we can go forward (show more recent segments)
  const canGoForward = visibleSegmentStart + currentVisibleCount < allSegments.length

  // Calculate the max start index (shows the final page of segments)
  const calculateMaxStart = useCallback((): number => {
    if (containerWidth === 0 || allSegments.length === 0) return 0
    
    const maxWidth = containerWidth - SIDEBAR_WIDTH
    let totalWidth = 0
    let count = 0
    
    // Count backwards from end to find how many fit
    for (let i = allSegments.length - 1; i >= 0; i--) {
      const width = getSegmentWidth(allSegments[i])
      if (totalWidth + width > maxWidth && count > 0) break
      totalWidth += width
      count++
    }
    
    return Math.max(0, allSegments.length - count)
  }, [allSegments, containerWidth, getSegmentWidth])

  // Navigate forward in time (show more recent segments)
  const handleGoForward = () => {
    const jumpCount = Math.max(1, currentVisibleCount)
    const maxStart = calculateMaxStart()
    const newStart = Math.min(maxStart, visibleSegmentStart + jumpCount)
    setVisibleSegmentStart(newStart)
  }

  // Handle tab navigation - ensure grid is always full
  const handleTabClick = (startIndex: number) => {
    // Calculate how many segments would be visible from this start point
    const segmentsFromStart = allSegments.length - startIndex
    const segmentsThatFit = calculateSegmentCount(0, containerWidth) // How many typically fit
    
    // If there aren't enough segments from startIndex to fill the screen,
    // start earlier so the grid is full
    if (segmentsFromStart < segmentsThatFit) {
      const adjustedStart = Math.max(0, allSegments.length - segmentsThatFit)
      setVisibleSegmentStart(adjustedStart)
    } else {
      setVisibleSegmentStart(startIndex)
    }
  }

  return (
    <div className="timeline-content">
      {/* Dark Gray Bar (Fixed at Top) */}
      <div className="top-nav-bar">
        {/* Patient Info */}
        <div className="timeline-nav-controls">
          <span className="nav-info">
            {patientData.patient.name} • {allSegments.filter(s => s.type === 'encounter').length} encounters
          </span>
        </div>
      </div>

      {/* Main Timeline Area (contains scrollable content) */}
      <div ref={mainAreaRef} className="timeline-main-area">
        {/* Scrollable Area (summary + grid + sidebar + ruler all scroll together) */}
        <div className="timeline-scrollable-area">
          {/* Patient Summary Section (Collapsible) */}
          <div className={`patient-summary-section ${isSummaryCollapsed ? 'collapsed' : ''}`}>
            {!isSummaryCollapsed && (
              <div className="patient-summary-content">
                <PatientRail patient={patientData.patient} />
                <ClinicalSummaryHeader segments={allSegments} />
              </div>
            )}
            <div 
              className="collapse-toggle-bar" 
              onClick={() => setIsSummaryCollapsed(!isSummaryCollapsed)}
              title={isSummaryCollapsed ? 'Expand patient summary' : 'Collapse patient summary'}
            >
              <span className="collapse-arrow">{isSummaryCollapsed ? '▼' : '▲'}</span>
            </div>
          </div>

          {/* Timeline Grid + Sidebar */}
          <div className="timeline-unified-container">
            {/* Timeline Grid Container */}
            <div className="timeline-grid-container">
              <TrackStack
                ref={trackStackRef}
                patientData={patientData}
                segments={visibleSegments}
                onContextHighlight={setContextHighlightSegmentId}
                contextHighlightSegmentId={contextHighlightSegmentId}
                highlightedRow={highlightedRow}
              />
            </div>
            {/* Domain Sidebar (scrolls vertically with grid) */}
            <DomainSidebar 
              patientData={patientData}
              onRowHover={(trackName, subtypeName) => setHighlightedRow({ trackName, subtypeName })}
              onRowLeave={() => setHighlightedRow(null)}
            />
          </div>

          {/* Timeline Ruler (Sticky at bottom, inside scroll) */}
          <div className="timeline-ruler-container">
            <TimelineRuler 
              segments={visibleSegments} 
              contextHighlightSegmentId={contextHighlightSegmentId}
            />
          </div>
        </div>
      </div>

      {/* Navigation Tabs (Fixed at bottom) - only shows when needed */}
      <TimelineNavTabs
        allSegments={allSegments}
        visibleSegmentStart={visibleSegmentStart}
        segmentsThatFit={calculateSegmentCount(0, containerWidth)}
        onTabClick={handleTabClick}
      />
    </div>
  )
}

export default Timeline
