import React from "react";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { cn } from "../utils";

export function StatusBadge({ label, color }: { label: string; color: string }) {
  return (
    <Badge
      variant="outline"
      className="text-[10px] font-bold"
      style={{
        backgroundColor: `${color}15`,
        color: color,
        borderColor: `${color}40`,
      }}
    >
      {label}
    </Badge>
  );
}

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
}

export function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="p-4 rounded-lg bg-destructive/10 text-destructive text-sm font-medium">
      {message}
    </div>
  );
}
