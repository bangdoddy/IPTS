// src/CalendarPage.tsx
import React from "react";
import { CalendarView } from "../components/calendar/CalendarView";

export default function CalendarPage() {
  return (
    <div className="w-full max-w-none py-6 sm:py-10">
      <CalendarView />
    </div>
  );
}
