import { NavTab } from '../utils/types'

interface TimelineNavTabsProps {
  tabs: NavTab[]
  activeTabIndex: number
  onTabClick: (endIndex: number, tabIndex: number) => void
}

const TimelineNavTabs = ({ tabs, activeTabIndex, onTabClick }: TimelineNavTabsProps) => {
  if (tabs.length === 0) return null

  return (
    <div className="timeline-nav-tabs">
      {tabs.map((tab, index) => (
        <button
          key={index}
          className={`nav-tab ${index === activeTabIndex ? 'active' : ''}`}
          onClick={() => onTabClick(tab.endIndex, index)}
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

export default TimelineNavTabs
