import React, { useMemo, useRef, useState } from "react";
import { ChevronDown, Search, X } from "lucide-react";
import { Button } from "../../ui/button";
import { useOutsideClick } from "../hooks/useUIHooks";
import { cn } from "../utils";

export function DropdownFilter(props: {
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  allLabel: string;
  selectedValue: string | null;
  onSelect: (v: string | null) => void;
  items: Array<{ value: string; label: string }>;
  minWidthClass?: string;
  maxHeightClass?: string;
}) {
  const [search, setSearch] = useState("");
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return props.items;
    return props.items.filter((x) => x.label.toLowerCase().includes(q));
  }, [props.items, search]);

  return (
    <div className="relative inline-block text-left">
      <Button
        variant="outline"
        size="sm"
        onClick={props.onToggle}
        className={cn(
          "h-9 px-3 text-xs font-semibold border-2 transition-all duration-200",
          props.selectedValue
            ? "border-primary bg-primary/5 text-primary ring-2 ring-primary/20"
            : "border-input hover:border-primary/50"
        )}
      >
        <span className="truncate max-w-[150px]">
          {props.selectedValue || props.allLabel}
        </span>
        <ChevronDown
          className={cn(
            "ml-2 h-3 w-3 opacity-50 transition-transform duration-200",
            props.open && "rotate-180"
          )}
        />
      </Button>

      {props.open && (
        <div
          className={cn(
            "absolute left-0 mt-2 z-[100] rounded-xl border bg-popover text-popover-foreground shadow-2xl animate-in fade-in zoom-in-95 duration-200",
            props.minWidthClass || "min-w-[200px]"
          )}
        >
          <div className="p-2 border-b bg-muted/30">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <input
                autoFocus
                className="w-full bg-background border rounded-lg py-1.5 pl-8 pr-8 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-2 top-2 p-0.5 hover:bg-muted rounded-full transition-colors"
                >
                  <X className="h-3 w-3 text-muted-foreground" />
                </button>
              )}
            </div>
          </div>

          <div className={cn("py-1 overflow-y-auto", props.maxHeightClass || "max-h-[300px]")}>
            <button
              onClick={() => {
                props.onSelect(null);
                props.onClose();
              }}
              className={cn(
                "flex w-full items-center px-3 py-2 text-xs transition-colors hover:bg-accent hover:text-accent-foreground",
                !props.selectedValue && "bg-primary/10 text-primary font-bold"
              )}
            >
              {props.allLabel}
            </button>
            {filtered.map((item) => (
              <button
                key={item.value}
                onClick={() => {
                  props.onSelect(item.value);
                  props.onClose();
                }}
                className={cn(
                  "flex w-full items-center px-3 py-2 text-xs transition-colors hover:bg-accent hover:text-accent-foreground",
                  props.selectedValue === item.value && "bg-primary/10 text-primary font-bold"
                )}
              >
                {item.label}
              </button>
            ))}
            {filtered.length === 0 && (
              <div className="px-3 py-4 text-xs text-center text-muted-foreground italic">
                No items found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function HierarchyDropdowns(props: {
  divisionValue: string | null;
  departmentValue: string | null;
  sectionValue: string | null;
  divisions: string[];
  departments: string[];
  sections: string[];
  onDivision: (v: string | null) => void;
  onDepartment: (v: string | null) => void;
  onSection: (v: string | null) => void;
  divisionAllLabel?: string;
}) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState<null | "division" | "department" | "section">(null);
  useOutsideClick(wrapRef as any, () => setOpen(null));

  const divItems = useMemo(() => props.divisions.map((x) => ({ value: x, label: x })), [props.divisions]);
  const deptItems = useMemo(() => props.departments.map((x) => ({ value: x, label: x })), [props.departments]);
  const secItems = useMemo(() => props.sections.map((x) => ({ value: x, label: x })), [props.sections]);

  return (
    <div ref={wrapRef} className="mt-2 flex flex-wrap gap-2">
      <DropdownFilter
        open={open === "division"}
        onToggle={() => setOpen((v) => (v === "division" ? null : "division"))}
        onClose={() => setOpen(null)}
        allLabel={props.divisionAllLabel ?? "All Divisions (Paged)"}
        selectedValue={props.divisionValue}
        onSelect={props.onDivision}
        items={divItems}
        minWidthClass="min-w-[200px]"
        maxHeightClass="max-h-[300px] overflow-y-auto"
      />

      <DropdownFilter
        open={open === "department"}
        onToggle={() => setOpen((v) => (v === "department" ? null : "department"))}
        onClose={() => setOpen(null)}
        allLabel="All Departments"
        selectedValue={props.departmentValue}
        onSelect={props.onDepartment}
        items={deptItems}
        minWidthClass="min-w-[240px]"
        maxHeightClass="max-h-[300px] overflow-y-auto"
      />

      <DropdownFilter
        open={open === "section"}
        onToggle={() => setOpen((v) => (v === "section" ? null : "section"))}
        onClose={() => setOpen(null)}
        allLabel="All Sections"
        selectedValue={props.sectionValue}
        onSelect={props.onSection}
        items={secItems}
        minWidthClass="min-w-[260px]"
        maxHeightClass="max-h-[300px] overflow-y-auto"
      />
    </div>
  );
}
