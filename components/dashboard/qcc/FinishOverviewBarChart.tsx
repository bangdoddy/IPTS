import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Trophy } from "lucide-react";
import { PlanActualPairBarChart } from "./PlanActualPairBarChart";

type Props = {
  title: string;
  subtitle: string;
  actual: number;
  target: number;
  actualColor: string;
  targetColor: string;
  iconAccentClass: string;
  loading?: boolean;
};

export function FinishOverviewBarChart({
  title,
  subtitle,
  actual,
  target,
  actualColor,
  targetColor,
  iconAccentClass,
  loading,
}: Props) {
  const gradientKey = title.replace(/[^a-zA-Z0-9]/g, "_");

  return (
    <Card className="shadow-md border-border/50 bg-white rounded-2xl overflow-hidden min-w-0">
      <CardHeader className="p-6 pb-2">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${iconAccentClass}`}>
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <CardTitle className="text-xl sm:text-2xl font-bold">{title}</CardTitle>
            <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 pt-2">
        <PlanActualPairBarChart
          plan={target}
          actual={actual}
          planColor={targetColor}
          actualColor={actualColor}
          gradientKey={`total_${gradientKey}`}
          loading={loading}
        />
      </CardContent>
    </Card>
  );
}
