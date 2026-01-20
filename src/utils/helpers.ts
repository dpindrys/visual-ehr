// Helper functions for date math and formatting

export const daysBetween = (startStr: string, endStr: string): number => {
  const start = new Date(startStr)
  const end = new Date(endStr)
  return Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
}

export const monthsBetween = (startStr: string, endStr: string): number => {
  const start = new Date(startStr)
  const end = new Date(endStr)
  return (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth())
}

export const getGapMagnitude = (
  startStr: string,
  endStr: string
): 'minimal' | 'moderate' | 'extended' => {
  const days = daysBetween(startStr, endStr)
  const months = monthsBetween(startStr, endStr)

  if (days < 30) {
    return 'minimal'
  } else if (months <= 3) {
    return 'moderate'
  } else {
    return 'extended'
  }
}

export const getGapLabel = (
  startStr: string,
  endStr: string
): string => {
  const days = daysBetween(startStr, endStr)

  if (days < 30) {
    return '' // No label for small gaps (25px width)
  } else if (days <= 180) {
    return `${days}` // Just number for medium gaps (50px width)
  } else {
    return `${days} days` // Show "days" for large gaps (100px width)
  }
}

// Get gap column width based on duration
export const getGapWidth = (durationDays: number): number => {
  if (durationDays < 30) return 25
  if (durationDays <= 180) return 50
  return 100
}

export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export const formatDateTime = (dateStr: string): string => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export const sortEncountersByDate = (
  dates: string[]
): string[] => {
  return [...dates].sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
}
