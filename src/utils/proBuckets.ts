import { PatientReportedEntry, Segment } from './types'
import { findSegmentIndexForDateWithGaps } from './helpers'

export type ProSeverity = 'low' | 'moderate' | 'high' | 'very-high'

export type TrajectoryState = 'rising' | 'falling' | 'stable' | 'peak' | 'valley' | 'mixed'

export type ProBucket = {
  worstScore: number
  severity: ProSeverity
  trajectory?: TrajectoryState
  count: number
}

export function getProSeverity(score: number): ProSeverity {
  if (score <= 3) return 'low'
  if (score <= 6) return 'moderate'
  if (score <= 8) return 'high'
  return 'very-high'
}

export function classifyTrajectory(values: number[]): TrajectoryState | undefined {
  if (values.length <= 1) return undefined

  const first = values[0]
  const last = values[values.length - 1]

  if (values.length === 2) {
    if (last > first) return 'rising'
    if (last < first) return 'falling'
    return 'stable'
  }

  const worstVal = Math.max(...values)
  const worstIdx = values.indexOf(worstVal)
  const bestVal = Math.min(...values)
  const bestIdx = values.indexOf(bestVal)

  const isInterior = (idx: number) => idx > 0 && idx < values.length - 1

  if (isInterior(worstIdx) && worstVal > first && worstVal > last) {
    return 'peak'
  }

  if (isInterior(bestIdx) && bestVal < first && bestVal < last) {
    return 'valley'
  }

  let rises = 0
  let falls = 0
  for (let i = 1; i < values.length; i++) {
    if (values[i] > values[i - 1]) rises++
    else if (values[i] < values[i - 1]) falls++
  }

  if (rises > 0 && falls > 0) return 'mixed'
  if (last > first) return 'rising'
  if (last < first) return 'falling'
  return 'stable'
}

export function bucketProEntries(
  entries: PatientReportedEntry[],
  segments: Segment[],
  subtype: string
): Map<string, ProBucket> {
  const map = new Map<string, ProBucket>()
  if (segments.length === 0) return map

  const segById = new Map(segments.map((s) => [s.id, s]))
  const grouped = new Map<string, { score: number; date: string }[]>()

  for (const entry of entries) {
    const score = entry[subtype]
    if (score === undefined || score === null) continue

    const segIndex = findSegmentIndexForDateWithGaps(segments, entry.date)
    const seg = segments[segIndex]
    if (!seg) continue

    const list = grouped.get(seg.id) || []
    list.push({ score: score as number, date: entry.date })
    grouped.set(seg.id, list)
  }

  for (const [segId, observations] of grouped) {
    observations.sort((a, b) => a.date.localeCompare(b.date))
    const scores = observations.map((o) => o.score)
    const worstScore = Math.max(...scores)
    const seg = segById.get(segId)

    const isGap = seg?.type === 'gap'

    map.set(segId, {
      worstScore,
      severity: getProSeverity(worstScore),
      trajectory: isGap ? classifyTrajectory(scores) : undefined,
      count: observations.length,
    })
  }

  return map
}
