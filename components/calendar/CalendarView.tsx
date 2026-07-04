import { useMemo, useState } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { ChevronLeft, ChevronRight, MapPin, Calendar as CalendarIcon } from "lucide-react";
import { Badge } from "../ui/badge";
import {
  buildBpiCalendarEvents,
  getEventsForDate,
  getEventsInMonth,
  getEventsInNextMonth,
  type CalendarEventDetail,
} from "../../libs/bpiCalendar/buildCalendarEvents";
import { BPI_CALENDAR_YEAR } from "../../data/bpiCalendar2026";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** Seragam dengan aksen oranye sidebar (#e88539), tidak terlalu pudar */
const CALENDAR_EVENT_THEME = {
  text: "#9A3F0A",
  border: "#E88539",
  background: "rgba(232, 133, 57, 0.42)",
  dot: "#D66B1E",
};

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function formatEventDate(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function EventSidebarCard(props: {
  event: CalendarEventDetail;
  onClick: () => void;
}) {
  const { event } = props;
  return (
    <button
      type="button"
      onClick={props.onClick}
      className="w-full text-left flex items-start gap-2 hover:bg-accent/50 p-2.5 rounded-lg transition-colors border border-transparent hover:border-border/60"
    >
      <span
        className="w-2 h-2 rounded-full mt-1.5 shrink-0 block"
        style={{ backgroundColor: CALENDAR_EVENT_THEME.dot }}
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium leading-snug">{event.title}</p>
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{event.activityDetail}</p>
        <p className="text-xs font-semibold mt-1" style={{ color: CALENDAR_EVENT_THEME.text }}>
          {event.dateLabel}
        </p>
      </div>
    </button>
  );
}

export function CalendarView() {
  const today = useMemo(() => new Date(), []);
  const [currentDate, setCurrentDate] = useState(() => startOfMonth(new Date()));
  const [selectedEvent, setSelectedEvent] = useState<CalendarEventDetail | null>(null);

  const allEvents = useMemo(() => buildBpiCalendarEvents(), []);

  const viewYear = currentDate.getFullYear();
  const viewMonth = currentDate.getMonth();

  const thisMonthEvents = useMemo(
    () => getEventsInMonth(allEvents, viewYear, viewMonth),
    [allEvents, viewYear, viewMonth]
  );

  const nextMonthDate = useMemo(
    () => new Date(viewYear, viewMonth + 1, 1),
    [viewYear, viewMonth]
  );

  const upcomingMonthEvents = useMemo(
    () => getEventsInNextMonth(allEvents, viewYear, viewMonth),
    [allEvents, viewYear, viewMonth]
  );

  const { daysInMonth, startingDayOfWeek } = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const dim = new Date(year, month + 1, 0).getDate();
    return { daysInMonth: dim, startingDayOfWeek: firstDay.getDay() };
  }, [currentDate]);

  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < startingDayOfWeek; i++) calendarDays.push(null);
  for (let day = 1; day <= daysInMonth; day++) calendarDays.push(day);

  const goToPrevMonth = () => {
    setCurrentDate(new Date(viewYear, viewMonth - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(viewYear, viewMonth + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(startOfMonth(new Date()));
  };

  const thisMonthLabel = `${MONTH_NAMES[viewMonth]} ${viewYear}`;
  const nextMonthLabel = `${MONTH_NAMES[nextMonthDate.getMonth()]} ${nextMonthDate.getFullYear()}`;

  return (
    <div className="flex gap-6 h-full min-h-[520px]">
      <div className="w-80 shrink-0">
        <Card className="p-4 h-full">
          <div className="mb-5">
            <h3 className="text-lg font-semibold mb-1">Events</h3>
            <p className="text-xs text-muted-foreground">
              Calendar of Event BPI {BPI_CALENDAR_YEAR}
            </p>
          </div>

          <div className="mb-6">
            <h4 className="text-sm font-semibold mb-1">This month</h4>
            <p className="text-xs text-muted-foreground mb-3">{thisMonthLabel}</p>
            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {thisMonthEvents.length ? (
                thisMonthEvents.map((event) => (
                  <EventSidebarCard
                    key={event.groupId}
                    event={event}
                    onClick={() => setSelectedEvent(event)}
                  />
                ))
              ) : (
                <p className="text-xs text-muted-foreground py-2">No events this month.</p>
              )}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-1">Upcoming</h4>
            <p className="text-xs text-muted-foreground mb-3">Next month — {nextMonthLabel}</p>
            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {upcomingMonthEvents.length ? (
                upcomingMonthEvents.map((event) => (
                  <EventSidebarCard
                    key={event.groupId + "-next"}
                    event={event}
                    onClick={() => setSelectedEvent(event)}
                  />
                ))
              ) : (
                <p className="text-xs text-muted-foreground py-2">No events next month.</p>
              )}
            </div>
          </div>
        </Card>
      </div>

      <div className="flex-1 min-w-0">
        <Card className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div>
              <h2 className="text-2xl font-semibold">Calendar</h2>
              <p className="text-sm text-muted-foreground">
                {MONTH_NAMES[viewMonth]} {viewYear}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={goToToday}>
                <CalendarIcon className="h-4 w-4 mr-1" />
                Today
              </Button>
              <Button variant="outline" size="sm" onClick={goToPrevMonth}>
                <ChevronLeft className="h-4 w-4" />
                Prev
              </Button>
              <Button variant="outline" size="sm" onClick={goToNextMonth}>
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
            {DAY_NAMES.map((day) => (
              <div key={day} className="bg-muted p-2 text-center">
                <span className="text-xs font-medium text-muted-foreground">{day}</span>
              </div>
            ))}

            {calendarDays.map((day, index) => {
              if (day === null) {
                return <div key={`empty-${index}`} className="bg-muted/40 min-h-24 p-2" />;
              }

              const dateObj = new Date(viewYear, viewMonth, day);
              const dayEvents = getEventsForDate(allEvents, dateObj);
              const isToday = today.toDateString() === dateObj.toDateString();

              return (
                <div
                  key={day}
                  className={`bg-background min-h-24 p-2 border-t border-border ${
                    isToday ? "ring-2 ring-primary ring-inset" : ""
                  }`}
                >
                  <div className={`text-sm font-medium mb-1 ${isToday ? "text-primary" : ""}`}>
                    {day}
                  </div>
                  <div className="space-y-1">
                    {dayEvents.map((event) => (
                      <div
                        key={event.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => setSelectedEvent(event)}
                        onKeyDown={(e) => e.key === "Enter" && setSelectedEvent(event)}
                        className="text-xs px-1.5 py-1 rounded truncate cursor-pointer font-semibold transition-opacity hover:brightness-95"
                        style={{
                          backgroundColor: CALENDAR_EVENT_THEME.background,
                          color: CALENDAR_EVENT_THEME.text,
                          borderLeft: `4px solid ${CALENDAR_EVENT_THEME.border}`,
                        }}
                        title={event.activityDetail}
                      >
                        {event.calendarLabel}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent
          className="w-[min(22rem,calc(100vw-18rem))] max-w-sm p-4 gap-3 max-h-[85vh] overflow-y-auto lg:left-[calc(50%+8rem)] lg:translate-x-[-50%]"
        >
          {selectedEvent && (
            <>
              <DialogHeader className="space-y-2 pr-6">
                <DialogTitle className="text-base leading-snug">
                  <span className="flex flex-wrap items-center gap-2">
                    <Badge
                      variant="outline"
                      className="shrink-0"
                      style={{
                        backgroundColor: CALENDAR_EVENT_THEME.background,
                        color: CALENDAR_EVENT_THEME.text,
                        borderColor: CALENDAR_EVENT_THEME.border,
                      }}
                    >
                      {selectedEvent.type}
                    </Badge>
                    <span className="break-words">{selectedEvent.title}</span>
                  </span>
                </DialogTitle>
                <DialogDescription className="text-xs leading-relaxed">
                  {selectedEvent.description}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Activity
                  </p>
                  <p className="mt-1 font-medium text-sm break-words">{selectedEvent.activityDetail}</p>
                </div>

                <div className="space-y-2.5 rounded-lg border border-border/60 bg-muted/30 p-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Schedule</p>
                    <p className="mt-0.5 font-medium">{selectedEvent.dateLabel}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Calendar date</p>
                    <p className="mt-0.5">{formatEventDate(selectedEvent.date)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Category</p>
                    <p className="mt-0.5 break-words">{selectedEvent.category}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Status</p>
                    <p className="mt-0.5">
                      <Badge variant="secondary">{selectedEvent.status}</Badge>
                    </p>
                  </div>
                  {selectedEvent.parentActivity && (
                    <div>
                      <p className="text-xs text-muted-foreground">Program</p>
                      <p className="mt-0.5 flex items-start gap-2 break-words">
                        <MapPin className="w-4 h-4 shrink-0 text-muted-foreground mt-0.5" />
                        {selectedEvent.parentActivity}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button size="sm" variant="outline" onClick={() => setSelectedEvent(null)}>
                  Close
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

