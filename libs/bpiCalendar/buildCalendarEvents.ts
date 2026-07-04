import {
  BPI_CALENDAR_ROWS,
  BPI_CALENDAR_YEAR,
  BPI_CATEGORY_COLORS,
  BPI_CATEGORY_LABELS,
  type BpiCalendarRow,
  type BpiSchedule,
} from "../../data/bpiCalendar2026";

export type CalendarEventType = "BPI" | "QCC" | "SS" | "QCP";

export interface CalendarEventDetail {
  id: string;
  groupId: string;
  type: CalendarEventType;
  title: string;
  calendarLabel: string;
  activityNo: string;
  activity: string;
  parentActivity?: string;
  activityDetail: string;
  date: Date;
  endDate?: Date;
  dateLabel: string;
  time: string;
  location: string;
  color: string;
  description: string;
  status: string;
  category: string;
}

const MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function atUtcDate(year: number, monthIndex: number, day: number) {
  return new Date(year, monthIndex, day);
}

/** Minggu ke-N dalam bulan: hari 1–7 = W1, 8–14 = W2, … */
export function getDaysInWeekOfMonth(year: number, month: number, week: number): number[] {
  const days: number[] = [];
  const last = new Date(year, month, 0).getDate();
  for (let d = 1; d <= last; d++) {
    if (Math.ceil(d / 7) === week) days.push(d);
  }
  return days;
}

function expandSchedule(row: BpiCalendarRow, schedule: BpiSchedule): Date[] {
  const year = BPI_CALENDAR_YEAR;
  const monthIndex = schedule.month - 1;

  if (schedule.mode === "dateRange") {
    const out: Date[] = [];
    for (let d = schedule.startDay; d <= schedule.endDay; d++) {
      out.push(atUtcDate(year, monthIndex, d));
    }
    return out;
  }

  return getDaysInWeekOfMonth(year, schedule.month, schedule.week).map((d) =>
    atUtcDate(year, monthIndex, d)
  );
}

function formatDateLabel(schedule: BpiSchedule, dates: Date[]): string {
  const m = MONTH_SHORT[schedule.month - 1];
  if (schedule.mode === "dateRange") {
    return `${schedule.startDay}–${schedule.endDay} ${m} ${BPI_CALENDAR_YEAR}`;
  }
  return `Week ${schedule.week}, ${m} ${BPI_CALENDAR_YEAR}`;
}

function shortCalendarLabel(row: BpiCalendarRow, schedule: BpiSchedule): string {
  if (row.category === "aic") return "AIC";
  if (schedule.mode === "weekOfMonth") return `${row.activity} W${schedule.week}`;
  return row.category === "aic" ? "AIC" : row.activity.slice(0, 12);
}

function buildOne(row: BpiCalendarRow, schedule: BpiSchedule, date: Date, dates: Date[]): CalendarEventDetail {
  const color = BPI_CATEGORY_COLORS[row.category];
  const dateLabel = formatDateLabel(schedule, dates);
  const parent = row.parentActivity ?? BPI_CATEGORY_LABELS[row.category];
  const activityDetail = `${row.activityNo} · ${row.activity} — ${parent}`;

  return {
    id: `${row.id}-${date.toISOString().slice(0, 10)}`,
    groupId: row.id,
    type: "BPI",
    title: `${BPI_CATEGORY_LABELS[row.category]} — ${row.activity}`,
    calendarLabel:
      row.id === "1.1.1"
        ? "AIC"
        : shortCalendarLabel(row, schedule),
    activityNo: row.activityNo,
    activity: row.activity,
    parentActivity: row.parentActivity,
    activityDetail,
    date,
    endDate: dates.length > 1 ? dates[dates.length - 1] : undefined,
    dateLabel,
    time: dateLabel,
    location: row.activity,
    color,
    description: `${parent}. ${dateLabel}.`,
    status: "Scheduled",
    category: BPI_CATEGORY_LABELS[row.category],
  };
}

export function buildBpiCalendarEvents(): CalendarEventDetail[] {
  const all: CalendarEventDetail[] = [];

  for (const row of BPI_CALENDAR_ROWS) {
    for (const schedule of row.schedules) {
      const dates = expandSchedule(row, schedule);
      for (const date of dates) {
        all.push(buildOne(row, schedule, date, dates));
      }
    }
  }

  return all.sort((a, b) => a.date.getTime() - b.date.getTime());
}

export function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function isInMonth(d: Date, year: number, monthIndex: number) {
  return d.getFullYear() === year && d.getMonth() === monthIndex;
}

export function getEventsForDate(events: CalendarEventDetail[], date: Date) {
  return events.filter((e) => isSameDay(e.date, date));
}

export function dedupeByGroup(events: CalendarEventDetail[]) {
  const seen = new Set<string>();
  const out: CalendarEventDetail[] = [];
  for (const e of events) {
    if (seen.has(e.groupId)) continue;
    seen.add(e.groupId);
    out.push(e);
  }
  return out.sort((a, b) => a.date.getTime() - b.date.getTime());
}

export function getEventsInMonth(events: CalendarEventDetail[], year: number, monthIndex: number) {
  return dedupeByGroup(events.filter((e) => isInMonth(e.date, year, monthIndex)));
}

export function getEventsInNextMonth(events: CalendarEventDetail[], year: number, monthIndex: number) {
  const next = new Date(year, monthIndex + 1, 1);
  return dedupeByGroup(getEventsInMonth(events, next.getFullYear(), next.getMonth()));
}
