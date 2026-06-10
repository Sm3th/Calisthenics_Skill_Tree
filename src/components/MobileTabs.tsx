export type MobileTab = "tree" | "progress";

interface MobileTabsProps {
  value: MobileTab;
  onChange: (tab: MobileTab) => void;
}

const TABS: { id: MobileTab; label: string }[] = [
  { id: "tree", label: "Skill Tree" },
  { id: "progress", label: "Progress" },
];

/**
 * Segmented control shown only on mobile (the parent hides it at >= md).
 * Lets the skill tree be the default first view while keeping the progress
 * overview one tap away. Controlled — all state lives in the parent so both
 * tabs read from the same source of truth.
 */
export function MobileTabs({ value, onChange }: MobileTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Switch between the skill tree and your progress"
      className="grid grid-cols-2 gap-1 rounded-xl border border-edge bg-ink/60 p-1"
    >
      {TABS.map((tab) => {
        const active = value === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active}
            aria-pressed={active}
            onClick={() => onChange(tab.id)}
            className={[
              "rounded-lg px-3 py-2 text-sm font-semibold transition",
              active
                ? "bg-lime text-ink"
                : "text-zinc-400 hover:text-zinc-100",
            ].join(" ")}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
