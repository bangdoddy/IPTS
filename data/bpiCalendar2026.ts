/** BPI Calendar of Event 2026 — sumber dummy (selaras slide Calendar of Event BPI) */

export type BpiCategory =
  | "aic"
  | "site-verification"
  | "site-convention"
  | "inovasis"
  | "tkmpn";

export type BpiSchedule =
  | { mode: "dateRange"; month: number; startDay: number; endDay: number }
  | { mode: "weekOfMonth"; month: number; week: number };

export type BpiCalendarRow = {
  id: string;
  activityNo: string;
  activity: string;
  parentActivity?: string;
  pic?: string;
  remark?: string;
  category: BpiCategory;
  schedules: BpiSchedule[];
};

export const BPI_CATEGORY_COLORS: Record<BpiCategory, string> = {
  aic: "#0a8291",
  "site-verification": "#7FED84",
  "site-convention": "#5FCEA0",
  inovasis: "#006187",
  tkmpn: "#EE642E",
};

export const BPI_CATEGORY_LABELS: Record<BpiCategory, string> = {
  aic: "AIC",
  "site-verification": "Site Project Verification (BVL)",
  "site-convention": "Site Convention",
  inovasis: "InovaSIS Quality Convention",
  tkmpn: "Temu Karya Mutu & Produktivitas Nasional",
};

export const BPI_CALENDAR_YEAR = 2026;

export const BPI_CALENDAR_ROWS: BpiCalendarRow[] = [
  {
    id: "1.1.1",
    activityNo: "1.1.1",
    activity: "Online Presentation",
    parentActivity: "AIC (AlamTri Innovation Convention)",
    category: "aic",
    schedules: [{ mode: "dateRange", month: 5, startDay: 21, endDay: 23 }],
  },
  {
    id: "1.1.2",
    activityNo: "1.1.2",
    activity: "Final Presentation & Awarding",
    parentActivity: "AIC (AlamTri Innovation Convention)",
    category: "aic",
    schedules: [{ mode: "dateRange", month: 6, startDay: 9, endDay: 13 }],
  },
  {
    id: "1.2.1",
    activityNo: "1.2.1",
    activity: "ADMO",
    parentActivity: "Site Project Verification (BVL)",
    category: "site-verification",
    schedules: [{ mode: "weekOfMonth", month: 8, week: 5 }],
  },
  {
    id: "1.2.2",
    activityNo: "1.2.2",
    activity: "MACO",
    parentActivity: "Site Project Verification (BVL)",
    category: "site-verification",
    schedules: [{ mode: "weekOfMonth", month: 8, week: 5 }],
  },
  {
    id: "1.2.3",
    activityNo: "1.2.3",
    activity: "SERA",
    parentActivity: "Site Project Verification (BVL)",
    category: "site-verification",
    schedules: [{ mode: "weekOfMonth", month: 8, week: 5 }],
  },
  {
    id: "1.2.4",
    activityNo: "1.2.4",
    activity: "JAHO - NARO",
    parentActivity: "Site Project Verification (BVL)",
    category: "site-verification",
    schedules: [{ mode: "weekOfMonth", month: 9, week: 3 }],
  },
  {
    id: "1.3.1",
    activityNo: "1.3.1",
    activity: "ADMO",
    parentActivity: "Site Convention",
    category: "site-convention",
    schedules: [{ mode: "weekOfMonth", month: 9, week: 4 }],
  },
  {
    id: "1.3.2",
    activityNo: "1.3.2",
    activity: "MACO",
    parentActivity: "Site Convention",
    category: "site-convention",
    schedules: [{ mode: "weekOfMonth", month: 9, week: 3 }],
  },
  {
    id: "1.3.3",
    activityNo: "1.3.3",
    activity: "SERA",
    parentActivity: "Site Convention",
    category: "site-convention",
    schedules: [{ mode: "weekOfMonth", month: 9, week: 3 }],
  },
  {
    id: "1.3.4",
    activityNo: "1.3.4",
    activity: "JAHO - NARO",
    parentActivity: "Site Convention",
    category: "site-convention",
    schedules: [{ mode: "weekOfMonth", month: 9, week: 5 }],
  },
  {
    id: "1.4.1",
    activityNo: "1.4.1",
    activity: "Final Presentation",
    parentActivity: "InovaSIS Quality Convention",
    category: "inovasis",
    schedules: [{ mode: "weekOfMonth", month: 11, week: 3 }],
  },
  {
    id: "1.4.2",
    activityNo: "1.4.2",
    activity: "Awarding",
    parentActivity: "InovaSIS Quality Convention",
    category: "inovasis",
    schedules: [{ mode: "weekOfMonth", month: 11, week: 3 }],
  },
  {
    id: "1.5.1",
    activityNo: "1.5.1",
    activity: "Final Presentation & Awarding",
    parentActivity: "Temu Karya Mutu & Produktivitas Nasional",
    category: "tkmpn",
    schedules: [{ mode: "weekOfMonth", month: 12, week: 4 }],
  },
];
