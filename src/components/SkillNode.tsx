import type { Skill, SkillState } from "../data/skills";

const STATE_STYLES: Record<SkillState, string> = {
  locked:
    "border-edge bg-surface/60 text-zinc-500 cursor-not-allowed opacity-60",
  available:
    "border-zinc-600 bg-surface text-zinc-100 hover:border-zinc-400",
  in_progress:
    "border-lime bg-surface text-zinc-100 ring-1 ring-lime/60 hover:ring-lime",
  mastered:
    "border-lime bg-lime text-ink font-semibold hover:brightness-105",
};

const STATE_LABEL: Record<SkillState, string> = {
  locked: "Locked",
  available: "Available",
  in_progress: "In progress",
  mastered: "Mastered",
};

interface SkillNodeProps {
  skill: Skill;
  state: SkillState;
  selected: boolean;
  justMastered?: boolean;
  onSelect: (id: string) => void;
}

export function SkillNode({
  skill,
  state,
  selected,
  justMastered,
  onSelect,
}: SkillNodeProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(skill.id)}
      aria-pressed={selected}
      data-state={state}
      data-testid={`skill-node-${skill.id}`}
      title={`${skill.name} — ${STATE_LABEL[state]}`}
      className={[
        "group relative flex w-44 flex-col gap-1 rounded-xl border px-4 py-3 text-left transition-all",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-lime/80",
        STATE_STYLES[state],
        selected ? "scale-[1.02] ring-2 ring-lime" : "",
        justMastered ? "animate-master" : "",
      ].join(" ")}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm leading-tight">{skill.name}</span>
        {state === "locked" && (
          <span aria-hidden className="text-xs">
            🔒
          </span>
        )}
        {state === "mastered" && (
          <span aria-hidden className="text-xs">
            ✓
          </span>
        )}
      </div>
      <div
        className={[
          "flex items-center gap-1 text-[10px] uppercase tracking-wide",
          state === "mastered" ? "text-ink/70" : "text-zinc-500",
        ].join(" ")}
      >
        <DifficultyDots
          difficulty={skill.difficulty}
          mastered={state === "mastered"}
        />
        <span className="ml-auto">{STATE_LABEL[state]}</span>
      </div>
    </button>
  );
}

function DifficultyDots({
  difficulty,
  mastered,
}: {
  difficulty: number;
  mastered: boolean;
}) {
  return (
    <span
      className="flex items-center gap-0.5"
      aria-label={`Difficulty ${difficulty} of 5`}
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={[
            "h-1.5 w-1.5 rounded-full",
            i < difficulty
              ? mastered
                ? "bg-ink/70"
                : "bg-lime"
              : mastered
                ? "bg-ink/20"
                : "bg-zinc-700",
          ].join(" ")}
        />
      ))}
    </span>
  );
}
