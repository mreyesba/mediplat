export interface ChartPoint {
  label: string
  seriesA: number
  seriesB: number
}

// Mock data for now; swap this body for a real fetch/DB call later.
export function useChartData(): ChartPoint[] {
  return [
    { label: 'Q1', seriesA: 12, seriesB: 18 },
    { label: 'Q2', seriesA: 19, seriesB: 14 },
    { label: 'Q3', seriesA: 15, seriesB: 22 },
  ]
}
