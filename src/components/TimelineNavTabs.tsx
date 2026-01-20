import { useMemo } from 'react'
import { Segment } from '../utils/types'

interface TimelineNavTabsProps {
  allSegments: Segment[]
  visibleSegmentStart: number
  segmentsThatFit: number // How many segments fit in the visible grid
  onTabClick: (startIndex: number) => void
}

interface Tab {
  startIndex: number
  endIndex: number
  startDate: string
  endDate: string
  encounterCount: number
}

const TimelineNavTabs = ({
  allSegments,
  visibleSegmentStart,
  segmentsThatFit,
  onTabClick,
}: TimelineNavTabsProps) => {
  // Calculate tabs based on how many "pages" of data exist
  const tabs = useMemo(() => {
    if (allSegments.length === 0 || segmentsThatFit === 0) return []

    // Get only encounter segments for counting
    const encounterSegments = allSegments.filter(s => s.type === 'encounter')
    if (encounterSegments.length === 0) return []

    // Encounters are roughly half of all segments (encounters + gaps between)
    const encountersThatFit = Math.max(1, Math.floor(segmentsThatFit / 2))
    
    // Calculate how many tabs (pages) are needed
    const tabCount = Math.ceil(encounterSegments.length / encountersThatFit)
    
    // If only 1 tab needed, everything fits - no tabs necessary
    if (tabCount <= 1) return []

    const result: Tab[] = []
    
    for (let i = 0; i < tabCount; i++) {
      const startEncounterIdx = i * encountersThatFit
      if (startEncounterIdx >= encounterSegments.length) break
      
      const endEncounterIdx = Math.min((i + 1) * encountersThatFit - 1, encounterSegments.length - 1)
      
      const startEncounter = encounterSegments[startEncounterIdx]
      const endEncounter = encounterSegments[endEncounterIdx]
      
      // Find the actual segment indices in allSegments
      const startIndex = allSegments.findIndex(s => s.id === startEncounter.id)
      const endIndex = allSegments.findIndex(s => s.id === endEncounter.id)
      
      result.push({
        startIndex,
        endIndex,
        startDate: formatDateShort(startEncounter.label),
        endDate: formatDateShort(endEncounter.label),
        encounterCount: endEncounterIdx - startEncounterIdx + 1,
      })
    }
    
    return result
  }, [allSegments, segmentsThatFit]) // Recalculate when segments or capacity changes

  // Find which tab is currently active
  // Check which tab contains the END of the visible range (most relevant for "where are we now")
  const activeTabIndex = useMemo(() => {
    if (tabs.length === 0) return 0
    
    // Calculate the end of the visible range
    const visibleEnd = Math.min(visibleSegmentStart + segmentsThatFit - 1, allSegments.length - 1)
    
    // Find which tab contains the last visible segment
    for (let i = tabs.length - 1; i >= 0; i--) {
      const tab = tabs[i]
      if (visibleEnd >= tab.startIndex) {
        return i
      }
    }
    
    return 0
  }, [tabs, visibleSegmentStart, segmentsThatFit, allSegments.length])

  if (tabs.length === 0) return null

  return (
    <div className="timeline-nav-tabs">
      {tabs.map((tab, index) => (
        <button
          key={index}
          className={`nav-tab ${index === activeTabIndex ? 'active' : ''}`}
          onClick={() => onTabClick(tab.startIndex)}
          title={`${tab.encounterCount} encounter${tab.encounterCount > 1 ? 's' : ''}`}
        >
          <span className="tab-date-range">
            {tab.startDate} - {tab.endDate}
          </span>
        </button>
      ))}
    </div>
  )
}

// Format date for tab labels - adapt to available space
function formatDateShort(dateStr: string): string {
  // Input might be "Jan 14, 2025" or similar
  // Try to parse and return abbreviated format
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) {
    // If parsing fails, just return first part
    return dateStr.split(',')[0] || dateStr.substring(0, 8)
  }
  
  const month = date.toLocaleDateString('en-US', { month: 'short' })
  const year = date.getFullYear().toString().slice(-2)
  return `${month} '${year}`
}

export default TimelineNavTabs
