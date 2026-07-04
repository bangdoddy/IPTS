// src/routes/viewPaths.ts
export type ViewKey =
  | "home"
  | "create"
  | "dashboard"
  | "historical"
  | "calendar"
  | "approval";

export const VIEW_PATHS: Record<ViewKey, string> = {
  home: "/home",
  create: "/create",
  dashboard: "/dashboard",
  historical: "/historical",
  calendar: "/calendar",
  approval: "/approval",
};

export function getViewFromPath(pathname: string): ViewKey {
  const p = (pathname || "").toLowerCase();
  const clean = p.endsWith("/") && p.length > 1 ? p.slice(0, -1) : p;

  switch (clean) {
    case VIEW_PATHS.approval:
      return "approval";
    case VIEW_PATHS.calendar:
      return "calendar";
    case VIEW_PATHS.historical:
      return "historical";
    case VIEW_PATHS.dashboard:
      return "dashboard";
    case VIEW_PATHS.create:
      return "create";
    case VIEW_PATHS.home:
      return "home";
    default:
      return "home";
  }
}

export function getPathFromView(view: ViewKey): string {
  return VIEW_PATHS[view] ?? VIEW_PATHS.home;
}
