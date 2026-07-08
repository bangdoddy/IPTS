/**
 * Chart bar colors — konsisten di SS, QCC, QCP:
 * Plan = orange, Actual = biru/teal (nuansa sedikit beda per modul).
 */
export const BRAND_SIDEBAR = {
  orange: "#e88539",
  teal: "#0a8291",
} as const;

export const SS_CHART_PALETTE = {
  plan: BRAND_SIDEBAR.orange,
  actual: BRAND_SIDEBAR.teal,
} as const;

/** Nuansa modul QCC (orange lebih terang, biru navy) */
export const QCC_CHART_PALETTE = {
  plan: "#EE642E",
  actual: "#006187",
} as const;

/** Nuansa modul QCP — amber + biru (jelas beda dari SS brand & QCC) */
export const QCP_CHART_PALETTE = {
  plan: "#F59E0B",
  actual: "#2563EB",
} as const;
