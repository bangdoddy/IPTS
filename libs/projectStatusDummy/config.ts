/** Set VITE_USE_DUMMY_PROJECT_STATUS=true to use dashboard demo data instead of API. */
export const USE_DUMMY_PROJECT_STATUS =
  String(import.meta.env.VITE_USE_DUMMY_PROJECT_STATUS ?? "").trim().toLowerCase() === "true";

export const DUMMY_LOAD_DELAY_MS = 300;
