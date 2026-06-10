import type { Skill } from "../data/skills";
import type { OverallProgress } from "../lib/tree";
import { MobileTabs, type MobileTab } from "./MobileTabs";

interface HeaderProps {
  overall: OverallProgress;
  recommended: Skill | null;
  mobileTab: MobileTab;
  onTabChange: (tab: MobileTab) => void;
  onExport: () => void;
  onImport: () => void;
  onReset: () => void;
  onInfo: () => void;
  onRecommendedClick: (id: string) => void;
}

export function Header({
  overall,
  recommended,
  mobileTab,
  onTabChange,
  onExport,
  onImport,
  onReset,
  onInfo,
  onRecommendedClick,
}: HeaderProps) {
  const onProgressTab = mobileTab === "progress";
  const onTreeTab = mobileTab === "tree";

  return (
    <header className="border-b border-edge bg-gradient-to-b from-surface to-ink">
      <div className="mx-auto max-w-6xl px-5 py-6 sm:py-8 md:py-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          {/* Title block — always visible; slimmer on mobile */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-lime">
              Street Workout
            </p>
            <div className="mt-2 flex items-center gap-3">
              <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">
                Calisthenics{" "}
                <span className="text-lime">Skill Tree</span>
              </h1>
              <button
                type="button"
                onClick={onInfo}
                aria-label="About this skill tree"
                title="What is this? How it works"
                className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border border-edge text-sm font-semibold text-zinc-400 transition hover:border-lime hover:text-lime focus:outline-none focus-visible:ring-2 focus-visible:ring-lime/80"
              >
                i
              </button>
            </div>
            <p className="mt-2 max-w-xl text-sm text-zinc-400 sm:mt-3 sm:text-base">
              Explore branching progressions, unlock the next move, and track
              your journey from your first push-up to the full planche.
            </p>
          </div>

          {/* Mobile-only tab switcher (hidden from md up) */}
          <div className="md:hidden">
            <MobileTabs value={mobileTab} onChange={onTabChange} />
          </div>

          {/* Stat + toolbar — Progress tab on mobile, always shown on desktop */}
          <div
            className={[
              onProgressTab ? "flex" : "hidden",
              "flex-col items-start gap-3 md:flex md:items-end",
            ].join(" ")}
          >
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-extrabold text-lime">
                {overall.mastered}
              </span>
              <span className="text-xl text-zinc-500">/ {overall.total}</span>
              <span className="ml-1 text-sm uppercase tracking-widest text-zinc-500">
                mastered
              </span>
            </div>
            <div className="h-1.5 w-56 overflow-hidden rounded-full bg-edge">
              <div
                className="h-full rounded-full bg-lime transition-all duration-500"
                style={{ width: `${overall.percent}%` }}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <ToolbarButton onClick={onExport}>Export</ToolbarButton>
              <ToolbarButton onClick={onImport}>Import</ToolbarButton>
              <ToolbarButton onClick={onReset} danger>
                Reset
              </ToolbarButton>
            </div>
          </div>
        </div>

        {/* Recommended banner — Tree tab on mobile, always shown on desktop */}
        {recommended && (
          <button
            type="button"
            onClick={() => onRecommendedClick(recommended.id)}
            className={[
              onTreeTab ? "flex" : "hidden",
              "mt-6 w-full items-center gap-3 rounded-xl border border-lime/40 bg-lime/5 px-4 py-3 text-left transition hover:bg-lime/10 md:mt-8 md:flex md:w-auto",
            ].join(" ")}
          >
            <span aria-hidden className="text-lg">
              ⚡
            </span>
            <span className="text-sm">
              <span className="text-zinc-400">Recommended next: </span>
              <span className="font-semibold text-lime">
                {recommended.name}
              </span>
            </span>
          </button>
        )}
      </div>
    </header>
  );
}

function ToolbarButton({
  children,
  onClick,
  danger,
}: {
  children: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-lg border px-3 py-1.5 text-xs font-medium transition",
        danger
          ? "border-edge text-zinc-400 hover:border-red-500/60 hover:text-red-400"
          : "border-edge text-zinc-300 hover:border-zinc-500 hover:text-zinc-100",
      ].join(" ")}
    >
      {children}
    </button>
  );
}
