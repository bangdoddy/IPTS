/** Dimensi & bentuk bar chart — selaras tab SS (DashboardLegacy SS_CHART_BAR_*) */
export const CHART_BAR_LAYOUT = {
  total: {
    maxBarSize: 320,
    barGap: 36,
    barCategoryGap: 0 as const,
    barRadius: [6, 6, 0, 0] as [number, number, number, number],
    height: 500,
    margin: { top: 58, right: 40, left: 52, bottom: 56 },
    labelFontSize: 24, // selaras SS_CHART_BAR_SINGLE
    xTickFontSize: 20,
    yTickFontSize: 16,
  },
  sites: {
    maxBarSize: 64,
    barGap: 10,
    barCategoryGap: "8%" as const,
    barRadius: [6, 6, 0, 0] as [number, number, number, number],
    height: 500,
    margin: { top: 58, right: 30, left: 52, bottom: 56 },
    labelFontSize: 18, // selaras SS (bar lebar → label lebih besar)
    xTickFontSize: 13,
    yTickFontSize: 16,
  },
  monthly: {
    maxBarSize: 48,
    barGap: 4,
    barCategoryGap: "2%" as const,
    barRadius: [6, 6, 0, 0] as [number, number, number, number],
    height: 500,
    margin: { top: 58, right: 30, left: 10, bottom: 60 },
    labelFontSize: 13, // selaras SS_CHART_BAR_DENSE
    xTickFontSize: 11,
    yTickFontSize: 16,
  },
} as const;
