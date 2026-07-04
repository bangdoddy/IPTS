import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { BarChart3, Activity, Target, Trophy, Filter, Calendar } from "lucide-react";
import { useQccDashboard } from "../hooks/useQccDashboard";
import { QccSummaryCharts } from "./QccSummaryCharts";
import { QccSiteDetailsCharts } from "./QccSiteDetailsCharts";
import { cn } from "../../ui/utils";

export function QccDashboardContainer() {
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
    const [selectedSite, setSelectedSite] = useState<string | null>(null);

    const { summary, monthly, breakdown, loading } = useQccDashboard({
        year: selectedYear,
        siteName: selectedSite
    });

    const years = useMemo(() => {
        const current = new Date().getFullYear();
        return [current, current - 1, current - 2];
    }, []);

    const sites = [
        { id: "ADMO", label: "ADMO" },
        { id: "JAHO-NARO", label: "JAHO-NARO" },
        { id: "MACO", label: "MACO" },
        { id: "SERA", label: "SERA" },
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header & Global Filters */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/50 p-4 rounded-2xl border border-border/50 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-orange-500/10 text-orange-600">
                        <BarChart3 className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">QCC Performance Dashboard</h2>
                        <p className="text-sm text-muted-foreground font-medium">Monitoring Target vs Actual Achievements</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-white p-1 rounded-xl border shadow-sm">
                        <div className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-muted-foreground uppercase tracking-wider border-r">
                            <Calendar className="w-3.5 h-3.5" />
                            Year
                        </div>
                        <Select 
                            value={selectedYear.toString()} 
                            onValueChange={(v) => setSelectedYear(parseInt(v))}
                        >
                            <SelectTrigger className="w-[100px] border-0 shadow-none focus:ring-0 font-bold">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {years.map(y => (
                                    <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center gap-2 bg-white p-1 rounded-xl border shadow-sm">
                         <div className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-muted-foreground uppercase tracking-wider border-r">
                            <Filter className="w-3.5 h-3.5" />
                            Site
                        </div>
                        <Select 
                            value={selectedSite || "all"} 
                            onValueChange={(v) => setSelectedSite(v === "all" ? null : v)}
                        >
                            <SelectTrigger className="w-[140px] border-0 shadow-none focus:ring-0 font-bold">
                                <SelectValue placeholder="All Sites" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Sites</SelectItem>
                                {sites.map(s => (
                                    <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {/* Top Row: Summary & Monthly Trends */}
            <QccSummaryCharts 
                summary={summary} 
                monthly={monthly} 
                loading={loading} 
                selectedSite={selectedSite}
            />

            {/* Bottom Row: Site Breakdown */}
            <QccSiteDetailsCharts 
                breakdown={breakdown} 
                loading={loading} 
                selectedSite={selectedSite}
            />

        </div>
    );
}
