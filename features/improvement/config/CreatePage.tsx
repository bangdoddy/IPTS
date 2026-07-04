import React, { useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import { Card, CardContent } from "../../../components/ui/card";
import { MODULES, ModuleId } from "../config/modules";
import { PATHS } from "../../../routes/paths";

export default function CreatePage() {
  const navigate = useNavigate();

  const moduleClick = useMemo<Record<ModuleId, () => void>>(
    () => ({
      ss: () => navigate(PATHS.SS),
      qcc: () => navigate(PATHS.QCC),
      qcp: () => navigate(PATHS.QCP),
      tebp: () => navigate(PATHS.TEBP),
      crp: () => navigate(PATHS.CRP),
    }),
    [navigate]
  );

  const handleModule = useCallback(
    (id: ModuleId) => {
      const fn = moduleClick[id];
      if (fn) fn();
    },
    [moduleClick]
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-12">
      <div className="mb-6 sm:mb-8 text-center">
        <h1 className="text-white text-2xl sm:text-3xl">
          Select the improvement type you want to create
        </h1>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {MODULES.map((m) => {
          const Icon = m.icon;
          return (
            <Card
              key={m.id}
              className="group hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden bg-card"
              onClick={() => handleModule(m.id)}
              style={{ ["--module-color" as any]: m.iconColor }}
            >
              <CardContent className="p-6">
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300"
                  style={{ backgroundColor: m.bgColor }}
                >
                  <Icon className="w-7 h-7" style={{ color: m.iconColor }} />
                </div>

                <h3 className="mb-2 transition-colors duration-300 group-hover:[color:var(--module-color)]">
                  {m.title}
                </h3>

                <p className="text-sm text-muted-foreground leading-relaxed transition-colors duration-300 group-hover:[color:var(--module-color)]">
                  {m.description}
                </p>

                <div
                  className="mt-4 h-1 w-0 group-hover:w-full rounded-full transition-all duration-300"
                  style={{ background: m.gradient }}
                />
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
