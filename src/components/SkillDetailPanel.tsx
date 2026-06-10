import { useEffect } from "react";
import type { Skill, SkillState } from "../data/skills";

interface SkillDetailPanelProps {
  skill: Skill | null;
  state: SkillState | undefined;
  prerequisites: { skill: Skill; state: SkillState }[];
  onClose: () => void;
  onSetMark: (id: string, mark: "in_progress" | "mastered" | null) => void;
}

const STATE_BADGE: Record<SkillState, string> = {
  locked: "bg-zinc-800 text-zinc-400",
  available: "bg-zinc-700 text-zinc-100",
  in_progress: "bg-lime/20 text-lime ring-1 ring-lime/50",
  mastered: "bg-lime text-ink",
};

export function SkillDetailPanel({
  skill,
  state,
  prerequisites,
  onClose,
  onSetMark,
}: SkillDetailPanelProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!skill || !state) return null;

  const locked = state === "locked";

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <aside
        className="relative flex h-full w-full max-w-md flex-col gap-6 overflow-y-auto border-l border-edge bg-surface p-6 shadow-2xl"
        data-testid="detail-panel"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <span
              className={[
                "inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
                STATE_BADGE[state],
              ].join(" ")}
            >
              {state.replace("_", " ")}
            </span>
            <h2 className="mt-2 text-2xl font-bold leading-tight">
              {skill.name}
            </h2>
            <p className="mt-1 text-xs uppercase tracking-widest text-zinc-500">
              {skill.category} · Difficulty {skill.difficulty}/5
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close panel"
            className="rounded-lg border border-edge px-2 py-1 text-zinc-400 transition hover:border-zinc-500 hover:text-zinc-100"
          >
            ✕
          </button>
        </div>

        <p className="text-zinc-300">{skill.description}</p>

        <div className="rounded-xl border border-edge bg-ink/40 p-4">
          <h4 className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
            Requirement to master
          </h4>
          <p className="mt-1 text-zinc-100">{skill.requirement}</p>
        </div>

        <div>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-widest text-zinc-500">
            Prerequisites
          </h4>
          {prerequisites.length === 0 ? (
            <p className="text-sm text-zinc-500">
              None — this is a starting skill.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {prerequisites.map(({ skill: p, state: ps }) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between rounded-lg border border-edge px-3 py-2 text-sm"
                >
                  <span>{p.name}</span>
                  <span
                    className={[
                      "rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wide",
                      ps === "mastered"
                        ? "text-lime"
                        : "text-zinc-500",
                    ].join(" ")}
                  >
                    {ps === "mastered" ? "✓ mastered" : ps}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-auto">
          {locked ? (
            <p className="rounded-xl border border-edge bg-ink/40 p-4 text-center text-sm text-zinc-400">
              🔒 Master the prerequisites above to unlock this skill.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
                Update progress
              </span>
              <div className="grid grid-cols-3 gap-2">
                <ProgressButton
                  label="Available"
                  active={state === "available"}
                  onClick={() => onSetMark(skill.id, null)}
                />
                <ProgressButton
                  label="In progress"
                  active={state === "in_progress"}
                  onClick={() => onSetMark(skill.id, "in_progress")}
                />
                <ProgressButton
                  label="Mastered"
                  active={state === "mastered"}
                  highlight
                  onClick={() => onSetMark(skill.id, "mastered")}
                />
              </div>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}

function ProgressButton({
  label,
  active,
  highlight,
  onClick,
}: {
  label: string;
  active: boolean;
  highlight?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={[
        "rounded-lg border px-2 py-2 text-xs font-medium transition",
        active
          ? highlight
            ? "border-lime bg-lime text-ink"
            : "border-lime bg-lime/15 text-lime"
          : "border-edge text-zinc-300 hover:border-zinc-500",
      ].join(" ")}
    >
      {label}
    </button>
  );
}
