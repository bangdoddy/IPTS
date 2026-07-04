// src/pages/HomePage.tsx
import React, { useState } from "react";
import { Card } from "../ui/card";

import imageLogo from "figma:asset/61a2558e1c35ada4e51acfac6fd341f0b4d33ce0.png";
import ssFlowchart from "figma:asset/428fcee08a5be71d02cd5b59d22c0f368629be94.png";
import qccFlowchart from "figma:asset/8f4d781fa1e80449ba83006df1e6f92881713d92.png";

type ModuleId = "ss" | "qcc" | "qcp" | "tebp" | "crp";

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}
import type { ComponentType } from "react";
export type ProjectType = "SS" | "QCC" | "QCP" ;
import { Lightbulb, Users, ClipboardCheck, TrendingUp, DollarSign } from "lucide-react";

export type ModuleConfig = {
  id: ModuleId;
  title: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  gradient: string;
  bgColor: string;
  iconColor: string;
  type: ProjectType;
};
export const MODULES: ModuleConfig[] = [
  {
    id: "ss",
    type: "SS",
    title: "Suggestion System",
    description: "Individual improvement ideas that can be implemented quickly",
    icon: Lightbulb,
    gradient: "linear-gradient(135deg, #006187 0%, #007B5F 100%)",
    bgColor: "rgba(0, 97, 135, 0.1)",
    iconColor: "#006187",
  },
  {
    id: "qcc",
    type: "QCC",
    title: "Quality Control Circle",
    description: "Team improvement within one department",
    icon: Users,
    gradient: "linear-gradient(135deg, #ED8330 0%, #EE642E 100%)",
    bgColor: "rgba(238, 100, 46, 0.1)",
    iconColor: "#EE642E",
  },
  {
    id: "qcp",
    type: "QCP",
    title: "Quality Control Project",
    description: "Cross-department improvement initiative with measurable outcomes",
    icon: ClipboardCheck,
    gradient: "linear-gradient(135deg, #5FCEA0 0%, #007B5F 100%)",
    bgColor: "rgba(95, 206, 160, 0.1)",
    iconColor: "#007B5F",
  }
];


export default function HomePage() {
  const [selectedHomeModule, setSelectedHomeModule] = useState<ModuleId | null>(null);

  return (
    <div className="min-h-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {MODULES.map((m) => {
              const Icon = m.icon;
              const isSelected = selectedHomeModule === m.id;

              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setSelectedHomeModule(isSelected ? null : m.id)}
                  className={cn(
                    "flex flex-col items-center group transition-all duration-300 rounded-2xl px-3 py-4",
                    isSelected ? "ring-4 ring-offset-2 bg-white" : "bg-white/10 backdrop-blur-sm hover:bg-white"
                  )}
                >
                  <div
                    className="w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all mb-2 group-hover:scale-105"
                    style={{ backgroundColor: m.iconColor }}
                  >
                    <Icon className="w-7 h-7 md:w-8 md:h-8 text-white" />
                  </div>

                  <h3
                    className={cn(
                      "text-xs md:text-sm text-center max-w-[90px] leading-tight transition-colors",
                      isSelected ? "" : "text-white"
                    )}
                    style={{ fontWeight: 700, color: isSelected ? m.iconColor : undefined }}
                  >
                    <span className={isSelected ? "" : "group-hover:hidden"}>{m.title}</span>
                    {!isSelected && (
                      <span className="hidden group-hover:inline" style={{ color: m.iconColor }}>
                        {m.title}
                      </span>
                    )}
                  </h3>
                </button>
              );
            })}
          </div>

          {selectedHomeModule && (
            <Card className="rounded-2xl p-6 sm:p-8 animate-in fade-in slide-in-from-top-4 duration-500 bg-card shadow-xl relative">
              <button
                type="button"
                onClick={() => setSelectedHomeModule(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full hover:bg-accent flex items-center justify-center transition-colors"
                style={{ color: MODULES.find((m) => m.id === selectedHomeModule)?.iconColor }}
              >
                ✕
              </button>

              <div className="flex items-start gap-4 pr-8">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: MODULES.find((m) => m.id === selectedHomeModule)?.bgColor }}
                >
                  {(() => {
                    const mm = MODULES.find((m) => m.id === selectedHomeModule);
                    const Icon = mm?.icon;
                    return Icon ? <Icon className="w-6 h-6" style={{ color: mm?.iconColor }} /> : null;
                  })()}
                </div>

                <div className="flex-1">
                  <h3
                    className="text-xl mb-3"
                    style={{ color: MODULES.find((m) => m.id === selectedHomeModule)?.iconColor }}
                  >
                    {MODULES.find((m) => m.id === selectedHomeModule)?.title}
                  </h3>

                  <div className="space-y-3 text-sm text-foreground">
                    {selectedHomeModule === "ss" && (
                      <>
                        <p><strong>What is Suggestion System?</strong></p>
                        <p>A platform for employees to submit individual improvement ideas that can be implemented quickly.</p>
                        <div className="mt-6">
                          <p className="mb-3"><strong>SS flow</strong></p>
                          <img
                            src={ssFlowchart}
                            alt="SS flow"
                            className="w-full h-auto object-contain rounded-lg shadow-md border-4 border-black"
                          />
                        </div>
                      </>
                    )}

                    {selectedHomeModule === "qcc" && (
                      <>
                        <p><strong>What is Quality Control Circle?</strong></p>
                        <p>A team-based approach where a small group collaborates to solve work-related problems.</p>
                        <div className="mt-6">
                          <p className="mb-3"><strong>QCC flow</strong></p>
                          <img
                            src={qccFlowchart}
                            alt="QCC flow"
                            className="w-full max-w-2xl h-auto object-contain rounded-lg shadow-md border-4 border-black mx-auto"
                          />
                        </div>
                      </>
                    )}

                    {selectedHomeModule === "qcp" && (
                      <>
                        <p><strong>What is Quality Control Project?</strong></p>
                        <p>A structured improvement initiative with clear targets and measurable outcomes.</p>
                      </>
                    )}

                    {selectedHomeModule === "tebp" && (
                      <>
                        <p><strong>What is The Executive Business Practices?</strong></p>
                        <p>Strategic business practice improvements requiring management approval and oversight.</p>
                      </>
                    )}

                    {selectedHomeModule === "crp" && (
                      <>
                        <p><strong>What is Cost Reduction Project?</strong></p>
                        <p>A measurable cost saving initiative without sacrificing quality or service.</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
