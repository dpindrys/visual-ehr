import { ProBucket } from '../utils/proBuckets'

interface ProCellProps {
  bucket?: ProBucket
  isHighlighted?: boolean
  segmentId: string
  onContextHighlight?: (segmentId?: string) => void
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
}: ProCellProps) => {
  if (!bucket) {
    return (
      <div
        className={`pro-cell empty ${isHighlighted ? 'context-highlighted' : ''}`}
        onMouseEnter={() => onContextHighlight?.(segmentId)}
        onMouseLeave={() => onContextHighlight?.(undefined)}
      />
    )
  }

  const severityClass = `severity-${bucket.severity}`

  return (
    <div
      className={`pro-cell ${severityClass} ${isHighlighted ? 'context-highlighted' : ''}`}
      onMouseEnter={() => onContextHighlight?.(segmentId)}
      onMouseLeave={() => onContextHighlight?.(undefined)}
    >
      <span className="pro-cell-content">{formatTrajectory(bucket)}</span>
    </div>
  )
}

export default ProCell
