import { useState, useRef, useEffect } from 'react'
import { PatientData, Segment, PeekCardState } from '../utils/types'
import Track from './Track'
import PeekCard from './PeekCard'

interface TrackStackProps {
  patientData: PatientData
  segments: Segment[]
  onScrollX: (x: number) => void
  onContextHighlight: (segmentId?: string) => void
  contextHighlightSegmentId?: string
}

const TrackStack = ({
  patientData,
  segments,
  onScrollX,
  onContextHighlight,
  contextHighlightSegmentId,
}: TrackStackProps) => {
  const [peekCardState, setPeekCardState] = useState<PeekCardState>({ isVisible: false })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStartX, setDragStartX] = useState(0)
  const [dragStartScrollX, setDragStartScrollX] = useState(0)
  const trackStackRef = useRef<HTMLDivElement>(null)

  // Horizontal pan (drag to scroll)
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStartX(e.clientX)
    setDragStartScrollX(e.currentTarget.scrollLeft || 0)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return

    const delta = e.clientX - dragStartX
    const newScrollX = Math.max(0, dragStartScrollX - delta)

    // Update parent's scrollX
    onScrollX(newScrollX)
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Close Peek Card when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (peekCardState.isVisible && !(e.target as HTMLElement).closest('.peek-card')) {
        setPeekCardState({ isVisible: false })
        onContextHighlight(undefined)
      }
    }

    if (peekCardState.isVisible) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [peekCardState.isVisible, onContextHighlight])

  const trackOrder = patientData.domainConfig.defaultTrackOrder

  return (
  <div
    ref={trackStackRef}
    className="track-stack"
    onMouseDown={handleMouseDown}
    onMouseMove={handleMouseMove}
    onMouseUp={handleMouseUp}
    onMouseLeave={handleMouseUp}
  >
    {/* Tracks */}
    {trackOrder.map((trackName) => (
      <Track
        key={trackName}
        trackName={trackName}
        patientData={patientData}
        segments={segments}
        contextHighlightSegmentId={contextHighlightSegmentId}
        onContextHighlight={onContextHighlight}
        onPeekCard={setPeekCardState}
      />
    ))}

    {/* Peek Card */}
    {peekCardState.isVisible && <PeekCard state={peekCardState} />}
  </div>
)
}

export default TrackStack
