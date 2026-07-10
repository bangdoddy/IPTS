import React, { useEffect, useMemo } from "react";
import { NavLink, useLocation } from "react-router-dom";

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

const parentActiveClass =
  "bg-white/30 text-white shadow-lg backdrop-blur-sm font-semibold";
const parentIdleClass = "text-white/90 hover:bg-white/20 hover:text-white";
const childLinkClass =
  "relative text-white/90 hover:bg-white/15 hover:text-white active:bg-transparent focus-visible:outline-none";
const childActiveClass = "text-white font-medium hover:bg-transparent";

export type SidebarItem = {
  key: string;
  label: string;
  to?: string;
  icon?: React.ReactNode;
  hidden?: boolean;
  children?: SidebarItem[];
};

/** Kunci parent yang harus terbuka agar `pathname` cocok dengan salah satu anak */
function collectOpenKeysForPath(items: SidebarItem[], pathname: string, ancestors: string[] = []): string[] {
  for (const item of items) {
    if (item.hidden) continue;
    if (item.to && pathname === item.to) {
      return ancestors;
    }
    if (item.children?.length) {
      const found = collectOpenKeysForPath(item.children, pathname, [...ancestors, item.key]);
      if (found.length) return found;
    }
  }
  return [];
}

function isPathUnderItem(item: SidebarItem, pathname: string): boolean {
  if (item.hidden) return false;
  if (item.to && pathname === item.to) return true;
  return (item.children ?? []).some((child) => isPathUnderItem(child, pathname));
}

export function SidebarMenu(props: { items: SidebarItem[]; level?: number }) {
  const items = props.items;
  const level = props.level ?? 0;
  const location = useLocation();

  const visibleItems = useMemo(
    () => items.filter((item) => item && !item.hidden),
    [items]
  );

  const routeOpenKeys = useMemo(
    () => collectOpenKeysForPath(visibleItems, location.pathname),
    [visibleItems, location.pathname]
  );

  const [openKeys, setOpenKeys] = React.useState<string[]>(routeOpenKeys);

  // Saat pindah halaman: buka hanya grup yang relevan; grup lain otomatis minimize
  useEffect(() => {
    setOpenKeys(routeOpenKeys);
  }, [location.pathname, routeOpenKeys]);

  const handleToggle = (key: string) => {
    if (level === 0) {
      // Accordion level atas: hanya satu dropdown terbuka
      setOpenKeys((prev) => (prev.includes(key) ? [] : [key]));
      return;
    }
    setOpenKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  return (
    <div className={level === 0 ? "" : "ml-2 border-l border-white/15 pl-1"}>
      {visibleItems.map((item) => {
        const hasChildren = Array.isArray(item.children) && item.children.some((c) => !c.hidden);
        const isOpen = openKeys.includes(item.key);
        const isDirectActive = Boolean(item.to && location.pathname === item.to);
        const isBranchActive = hasChildren && isPathUnderItem(item, location.pathname);

        return (
          <div key={item.key} className="mb-1">
            {hasChildren ? (
              <button
                type="button"
                onClick={() => handleToggle(item.key)}
                aria-expanded={isOpen}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 justify-between",
                  isDirectActive || isBranchActive ? parentActiveClass : parentIdleClass
                )}
                style={{ paddingLeft: `${level * 12 + 16}px` }}
              >
                <span className="flex items-center gap-3">
                  {item.icon}
                  <span>{item.label}</span>
                </span>
                <svg
                  className="w-4 h-4 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  {isOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  )}
                </svg>
              </button>
            ) : item.to ? (
              <NavLink
                to={item.to}
                end
                className={({ isActive: navActive }) => {
                  const active = isDirectActive || navActive;
                  const isChild = level > 0;
                  return cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200",
                    isChild
                      ? cn(childLinkClass, active && childActiveClass)
                      : active
                        ? parentActiveClass
                        : parentIdleClass
                  );
                }}
                style={{ paddingLeft: `${level * 12 + 16}px` }}
                onClick={() => {
                  if (level === 0) setOpenKeys([]);
                }}
              >
                {({ isActive: navActive }) => {
                  const active = isDirectActive || navActive;
                  return (
                    <>
                      {item.icon}
                      <span className="flex-1">{item.label}</span>
                      {level > 0 && active && (
                        <span
                          className="pointer-events-none absolute right-1 top-1/2 h-6 w-0.5 -translate-y-1/2 rounded-full bg-white"
                          aria-hidden
                        />
                      )}
                    </>
                  );
                }}
              </NavLink>
            ) : null}

            {hasChildren && isOpen && (
              <SidebarMenu items={item.children!} level={level + 1} />
            )}
          </div>
        );
      })}
    </div>
  );
}
