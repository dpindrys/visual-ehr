import { useRef, useState } from 'react'
import { ProBucket } from '../utils/proBuckets'

interface ProCellProps {
  bucket?: ProBucket
  isHighlighted?: boolean
  segmentId: string
  onContextHighlight?: (segmentId?: string) => void
  onPressStart?: (e: React.MouseEvent) => void
  onPressEnd?: () => void
}

function formatTrajectory(bucket: ProBucket): string {
  const score = bucket.worstScore
  const t = bucket.trajectory

  if (!t || t === 'stable') return `${score}`

  switch (t) {
    case 'rising': return `↑ ${score}`
    case 'falling': return `${score} ↓`
    case 'peak': return `↑ ${score} ↓`
    case 'valley': return `↓ ${score} ↑`
    case 'mixed': return `~ ${score}`
    default: return `${score}`
  }
}

const ProCell = ({
  bucket,
  isHighlighted,
  segmentId,
  onContextHighlight,
  onPressStart,
  onPressEnd,
}: ProCellProps) => {
  const [isPressed, setIsPressed] = useState(false)
  const cellRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!bucket) return
    e.preventDefault()
    setIsPressed(true)
    onContextHighlight?.(segmentId)
    onPressStart?.(e)
  }

  const handleMouseUp = () => {
    setIsPressed(false)
    onPressEnd?.()
    onContextHighlight?.(undefined)
  }

  const handleMouseEnter = () => {
    if (!isPressed) onContextHighlight?.(segmentId)
  }

  const handleMouseLeave = () => {
    if (!isPressed) onContextHighlight?.(undefined)
    if (isPressed) {
      setIsPressed(false)
      onPressEnd?.()
    }
  }

  if (!bucket) {
    return (
      <div
        ref={cellRef}
        className={`pro-cell empty ${isHighlighted ? 'context-highlighted' : ''}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      />
    )
  }

  const severityClass = `severity-${bucket.severity}`

  return (
    <div
      ref={cellRef}
      className={`pro-cell ${severityClass} ${isHighlighted ? 'context-highlighted' : ''} ${isPressed ? 'press-held' : ''}`}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <span className="pro-cell-content">{formatTrajectory(bucket)}</span>
    </div>
  )
}

export default ProCell
