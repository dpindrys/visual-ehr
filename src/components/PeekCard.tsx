import { PeekCardState, Encounter } from '../utils/types'
import Tooltip from './Tooltip'

interface PeekCardProps {
  state: PeekCardState
}

const PeekCard = ({ state }: PeekCardProps) => {
  if (!state.isVisible || !state.segment || !state.cellData) return null

  const { cellData, segment, x = 0, y = 0 } = state
  const metadata = (cellData.metadata ?? {}) as Record<string, unknown>
  const trackName = cellData.trackName

  if (segment.type === 'gap') {
    return <Tooltip type="gap" segment={segment} x={x} y={y} />
  }

  if (trackName === 'encounters' && segment.type === 'encounter') {
    let encounter = metadata.encounter as Encounter | undefined
    if (!encounter) {
      encounter = {
        id: segment.encounterId || '',
        date: (metadata.date as string) || segment.date || '',
        type: (metadata.type as string) || '',
        setting: (metadata.setting as string) || '',
        location: (metadata.location as string) || '',
        address: metadata.address as string | undefined,
        reason: (metadata.reason as string) || '',
        vitals: {},
        labs: {},
        diagnosesEvents: [],
        medicationEvents: [],
        notes: (metadata.notes as string) || '',
      }
    }
    return <Tooltip type="encounter" encounter={encounter} x={x} y={y} />
  }

  if ((trackName === 'vitals' || trackName === 'labs') && segment.type === 'encounter') {
    const rawValue = metadata.rawValue as number | undefined
    const rawValue2 = metadata.rawValue2 as number | undefined
    const rangeConfig = metadata.rangeConfig as ReturnType<typeof import('../utils/referenceRanges').getRangeConfig>
    const valueStatus = metadata.valueStatus as string | undefined
    const encounter = metadata.encounter as Encounter | undefined

    if (rawValue !== undefined && rangeConfig && valueStatus && encounter) {
      return (
        <Tooltip
          type="vitals-labs"
          status={valueStatus as import('../utils/referenceRanges').ValueStatus}
          value={rawValue}
          value2={rawValue2}
          date={encounter.date}
          config={rangeConfig}
          trackName={trackName}
          subtypeName={cellData.subtypeId}
          x={x}
          y={y}
        />
      )
    }

    if (encounter) {
      return <Tooltip type="encounter" encounter={encounter} x={x} y={y} />
    }
  }

  return null
}

export default PeekCard
