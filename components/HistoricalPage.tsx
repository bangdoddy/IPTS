// src/HistoricalPage.tsx
import React from "react";
import { HistoricalProjects } from "../components/historical/HistoricalProjects";

export default function HistoricalPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-12">
      <HistoricalProjects />
    </div>
  );
}
