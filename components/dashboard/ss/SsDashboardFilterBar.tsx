import React, { useMemo } from "react";
import { BarChart3, Calendar } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";

const SS_DEFAULT_YEAR = 2026;

type Props = {
  year: number;
  onYearChange: (year: number) => void;
};

export function SsDashboardFilterBar({ year, onYearChange }: Props) {
  const years = useMemo(() => {
    const current = new Date().getFullYear();
    return [current, current - 1, current - 2];
  }, []);

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/50 p-4 rounded-2xl border border-border/50 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-2xl bg-[#e88539]/10 text-[#e88539]">
          <BarChart3 className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">SS Performance Dashboard</h2>
          <p className="text-sm text-muted-foreground font-medium">
            Monitoring suggestion system — Plan vs Actual ({year})
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 bg-white p-1 rounded-xl border shadow-sm shrink-0">
        <div className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-muted-foreground uppercase tracking-wider border-r">
          <Calendar className="w-3.5 h-3.5" />
          Year
        </div>
        <Select value={String(year)} onValueChange={(v) => onYearChange(parseInt(v, 10))}>
          <SelectTrigger className="w-[100px] border-0 shadow-none focus:ring-0 font-bold">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {years.map((y) => (
              <SelectItem key={y} value={String(y)}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

export { SS_DEFAULT_YEAR };
