// Names and colours for the two shifts, shared by both charts.
// Colours come from src/index.css (peach and primary), so they switch with light/dark by themselves.
// ChartContainer turns each `color` into a CSS variable: --color-morning and --color-evening.
export const SHIFT_CHART_CONFIG = {
  morning: { label: 'Morning', color: 'var(--peach)' },
  evening: { label: 'Evening', color: 'var(--primary)' },
}
