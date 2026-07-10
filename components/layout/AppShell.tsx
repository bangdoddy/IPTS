// src/components/layout/AppShell.tsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { ThemeToggle } from "../theme/ThemeToggle";
import { Button } from "../ui/button";
import { getCookieJson } from "../../libs/cookie";
import { PATHS } from "../../routes/paths";
import { SidebarMenu } from "../SidebarMenu";
import {
  BarChart3,
  Calendar as CalendarIcon,
  Clock,
  Home as HomeIcon,
  Lightbulb,
  CheckCircle2,
  LogOut,
  User,
  Layers3,
  Search,
} from "lucide-react";

import imageLogo from "figma:asset/61a2558e1c35ada4e51acfac6fd341f0b4d33ce0.png";
import bgPattern from "figma:asset/5196d977f06817f07707778e03629c906a4b28fe.png";

type AuthCookie = {
  actorType?: string;
  actortype?: string;
  name?: string;
  nama?: string;
  jobsite?: string;
  [k: string]: any;
};

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

/** Best-effort cookie destroy (HttpOnly cannot be removed by JS) */
function destroyCookie(name: string) {
  const host = window.location.hostname;
  const parts = host.split(".");
  const rootDomain = parts.length >= 2 ? `.${parts.slice(-2).join(".")}` : host;

  const domains = [undefined, host, rootDomain];
  const paths = ["/", window.location.pathname];

  for (const path of paths) {
    document.cookie = `${name}=; Max-Age=0; path=${path}; samesite=lax`;
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}; samesite=lax`;

    for (const d of domains) {
      if (!d) continue;
      document.cookie = `${name}=; Max-Age=0; path=${path}; domain=${d}; samesite=lax`;
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}; domain=${d}; samesite=lax`;
    }
  }
}

function useAuthCookie() {
  return useMemo(() => {
    const key = "inovasis_auth";
    const val = getCookieJson<AuthCookie>(key);
    const actorTypeRaw = (val?.actorType ?? val?.actortype ?? "").toString();
    return {
      key,
      raw: val || null,
      name: val?.name ?? val?.nama,
      jobsite: val?.jobsite,
      actorType: actorTypeRaw.toUpperCase(),
    };
  }, []);
}

function HeaderBar({ userName, jobsite, onLogout }: { userName?: string; jobsite?: string; onLogout?: () => void }) {
  return (
    <header
      className="border-b shadow-sm sticky top-0 z-10"
      style={{ background: "linear-gradient(90deg, #e88539 0%, #0a8291 100%)" }}
    >
      <div className="px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          <div />

          <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
            <ThemeToggle />

            <div className="hidden md:flex items-center gap-3 px-4 py-2 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30">
              <User className="w-5 h-5 text-white shrink-0" />
              <div className="flex flex-col items-start leading-tight">
                <span className="text-sm text-white font-semibold">{userName || "User"}</span>
                {jobsite && (
                  <span className="text-xs text-white/80 font-normal mt-0.5">{jobsite}</span>
                )}
              </div>
            </div>

            {onLogout && (
              <>
                <Button
                  type="button"
                  onClick={onLogout}
                  className="hidden sm:inline-flex bg-white/20 hover:bg-white/30 text-white border border-white/30"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>

                <Button
                  type="button"
                  onClick={onLogout}
                  size="icon"
                  className="sm:hidden bg-white/20 hover:bg-white/30 text-white border border-white/30"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export function AppShell({ user }: { user: any }) {
  const navigate = useNavigate();
  const location = useLocation();

  const auth = useAuthCookie();
  const canAccessApproval = auth.actorType === "REVIEWER" || auth.actorType === "SUPERIOR";

  // Sidebar items with nested menu (3-level)
  const sidebarItems = useMemo(
    () => [
      { key: "home", label: "Home", to: PATHS.app.home, icon: <HomeIcon className="w-5 h-5" /> },
      { key: "create", label: "Create Idea or Project", to: PATHS.app.create, icon: <Lightbulb className="w-5 h-5" /> },
      { key: "dashboard", label: "Dashboard", to: PATHS.app.dashboard, icon: <BarChart3 className="w-5 h-5" /> },
      {
        key: "tracking", label: "Projects Tracking",
        to: PATHS.app.dashboard,
        icon: <Search className="w-5 h-5" />,
        children: [
          {
            key: "tracking-ss",
            label: "SS Tracking",
            children: [
              { key: "tracking-ss", label: "Projects", to: PATHS.app.trackingss },
              { key: "tracking-ss-draft", label: "Drafts", to: PATHS.app.projectstatussdraft },
            ],
          },
          { key: "tracking-qcc", label: "QCC Tracking", to: PATHS.app.trackingqcc },
          { key: "tracking-qcp", label: "QCP Tracking", to: PATHS.app.dashboard },
        ],
      },
      (auth.actorType === "REVIEWER" || auth.actorType === "SUPERIOR") ? {
        key: "master",
        label: "Master",
        icon: <Layers3 className="w-5 h-5" />,
        children: [
          ...(auth.actorType === "REVIEWER"
            ? [
              { key: "master-division", label: "Division", to: PATHS.app.masterDivision },
              { key: "master-department", label: "Department", to: PATHS.app.masterDepartment },
              { key: "master-section", label: "Section", to: PATHS.app.masterSection },
              { key: "master-data-plan", label: "Data Plan", to: PATHS.app.masterDataPlan },
              { key: "user-maintenance", label: "User Maintenance", to: PATHS.app.userMaintenance },
            ]
            : []),
        ],
      } : null,
      {
        key: "historical",
        label: "Historical Projects",
        icon: <Clock className="w-5 h-5" />,
        children: [
          {
            key: "historical-ss",
            label: "SS Projects",
            to: PATHS.app.projectstatusss,
            // children: [
            //   { key: "historical-ss-index", label: "Projects", to: PATHS.app.projectstatusss },
            //   { key: "historical-ss-draft", label: "Drafts", to: PATHS.app.projectstatussdraft },
            // ],
          },
          { key: "historical-qcc", label: "QCC Projects", to: PATHS.app.projectstatusqcc },
          { key: "historical-qcp", label: "QCP Projects", to: PATHS.app.projectstatusqcp },
        ],
      },
      { key: "calendar", label: "Calendar Event", to: PATHS.app.calendar, icon: <CalendarIcon className="w-5 h-5" /> },
      canAccessApproval
        ? {
          key: "approval",
          label: "Approval",
          icon: <CheckCircle2 className="w-5 h-5" />,
          children: [
            { key: "approval-ss", label: "SS", to: PATHS.app.approvalSS, icon: <CheckCircle2 className="w-4 h-4" /> },
            { key: "approval-qcc", label: "QCC", to: PATHS.app.approvalQCC, icon: <CheckCircle2 className="w-4 h-4" /> },
            { key: "approval-qcp", label: "QCP", to: PATHS.app.approvalQCP, icon: <CheckCircle2 className="w-4 h-4" /> },
          ],
        }
        : null,
    ].filter(Boolean),
    [canAccessApproval]
  );

  // Logout handler
  const handleLogout = useCallback(() => {
    destroyCookie("inovasis_auth");
    navigate(PATHS.auth.login, { replace: true });
  }, [navigate]);

  // Guard approval route
  useEffect(() => {
    const fullRoute = `${location.pathname}${location.search}${location.hash}`;

    if (location.pathname.toLowerCase().startsWith(PATHS.app.approval) && !canAccessApproval) {
      navigate(PATHS.app.home, { replace: true });
    }
  }, [canAccessApproval, location.pathname, navigate]);

  return (
    <div className="min-h-screen flex overflow-hidden">
      <aside
        className="w-64 border-r shadow-lg flex-col hidden lg:flex fixed left-0 top-0 bottom-0 z-20"
        style={{ background: "linear-gradient(180deg, #e88539 0%, #0a8291 100%)" }}
      >
        <div className="p-6 border-b border-white/20">
          <img src={imageLogo} alt="inovaSIS" className="h-8 w-auto mb-2" />
          <p className="text-xs text-white/90">Improvement Project Tracking System</p>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <SidebarMenu items={sidebarItems} />
        </nav>

        <div className="p-4 border-t border-white/20 space-y-3">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 rounded-lg px-4 py-2 bg-white/15 hover:bg-white/25 text-white transition"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-semibold">Logout</span>
          </button>

          <div className="text-center">
            <p className="text-white font-semibold">InovaSIS</p>
            <p className="text-white/90 text-xs">2025</p>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col lg:ml-64 min-w-0">
        <HeaderBar userName={user?.name || auth.name} jobsite={user?.jobsite || auth.jobsite} onLogout={handleLogout} />

        <div
          className="flex-1 overflow-y-auto overflow-x-auto"
          style={{
            backgroundImage: `url(${bgPattern})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundAttachment: "fixed",
          }}
        >
          <div className="w-full min-w-0 px-6 sm:px-10 md:px-12 lg:px-16 xl:px-20">
            {/* ✅ Pages will render here based on Route */}
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
