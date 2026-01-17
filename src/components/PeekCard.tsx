import { PeekCardState } from '../utils/types'
import { formatDate } from '../utils/helpers'

interface PeekCardProps {
  state: PeekCardState
}

const PeekCard = ({ state }: PeekCardProps) => {
  if (!state.isVisible || !state.segment || !state.cellData) return null

  const { cellData, segment, x = 0, y = 0 } = state

  const adjustedX = Math.max(10, x)
  const adjustedY = Math.max(10, y)

  const meta = (cellData.metadata ?? {}) as Record<string, unknown>

  return (
    <div
      className="peek-card"
      style={{
        left: adjustedX,
        top: adjustedY,
        position: 'fixed',
        zIndex: 9999,
      }}
    >
      <div className="peek-card-section">
        <div className="peek-card-label">Segment</div>
        <div className="peek-card-value">
          {segment.type === 'encounter'
            ? segment.date
              ? formatDate(segment.date)
              : 'Encounter'
            : segment.startDate && segment.endDate
              ? `${formatDate(segment.startDate)} → ${formatDate(segment.endDate)}`
              : 'Gap'}
        </div>
      </div>

      <div className="peek-card-section">
        <div className="peek-card-label">Cell</div>
        <div className="peek-card-value">
          {cellData.trackName} / {cellData.subtypeId}
        </div>
      </div>

      <div className="peek-card-section">
        <div className="peek-card-label">Value</div>
        <div className="peek-card-value">
          {Array.isArray(cellData.values) ? cellData.values.join(', ') : cellData.values}
        </div>
      </div>

      {Object.keys(meta).length > 0 && (
        <div className="peek-card-section">
          <div className="peek-card-label">Details</div>
          <pre className="peek-card-pre">{JSON.stringify(meta, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}

export default PeekCard