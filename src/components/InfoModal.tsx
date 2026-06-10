import { useEffect } from "react";

interface InfoModalProps {
  open: boolean;
  onClose: () => void;
}

const LEGEND: { label: string; dot: string; text: string }[] = [
  {
    label: "Locked",
    dot: "border border-edge bg-surface",
    text: "Prerequisites aren't mastered yet — keep working up the chain.",
  },
  {
    label: "Available",
    dot: "border border-zinc-500 bg-surface",
    text: "Unlocked and ready to start training.",
  },
  {
    label: "In progress",
    dot: "border border-lime bg-surface ring-1 ring-lime/60",
    text: "You're actively working toward this skill.",
  },
  {
    label: "Mastered",
    dot: "bg-lime",
    text: "Done — this unlocks the skills that depend on it.",
  },
];

export function InfoModal({ open, onClose }: InfoModalProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="info-modal-title"
    >
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div
        className="relative flex max-h-[85vh] w-full max-w-lg flex-col gap-6 overflow-y-auto rounded-2xl border border-edge bg-surface p-6 shadow-2xl"
        data-testid="info-modal"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-lime">
              About
            </p>
            <h2
              id="info-modal-title"
              className="mt-1 text-2xl font-bold leading-tight"
            >
              How the Skill Tree works
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close information"
            className="rounded-lg border border-edge px-2 py-1 text-zinc-400 transition hover:border-zinc-500 hover:text-zinc-100"
          >
            ✕
          </button>
        </div>

        <p className="text-zinc-300">
          This is an interactive map of calisthenics &amp; street-workout
          progressions. Skills are grouped into five categories — Push, Pull,
          Core, Legs and Static Holds — and each move connects to the ones it
          builds on. Follow the lines from left to right to see how a beginner
          movement grows into an advanced one.
        </p>

        <section>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-widest text-zinc-500">
            How to use it
          </h3>
          <ul className="flex flex-col gap-2 text-sm text-zinc-300">
            <li className="flex gap-2">
              <span aria-hidden className="text-lime">
                1.
              </span>
              <span>
                Tap any skill to open its details — description, the exact
                requirement to master it, and its prerequisites.
              </span>
            </li>
            <li className="flex gap-2">
              <span aria-hidden className="text-lime">
                2.
              </span>
              <span>
                Set your status: <strong>In progress</strong> while you train
                it, <strong>Mastered</strong> once you hit the requirement.
              </span>
            </li>
            <li className="flex gap-2">
              <span aria-hidden className="text-lime">
                3.
              </span>
              <span>
                Mastering a skill automatically unlocks everything that depends
                on it. Removing the mark re-locks the chain below it.
              </span>
            </li>
            <li className="flex gap-2">
              <span aria-hidden className="text-lime">
                4.
              </span>
              <span>
                Use search and the category filters to focus, and follow the
                <span className="text-lime"> ⚡ Recommended next</span> hint for
                the best move to chase right now.
              </span>
            </li>
          </ul>
        </section>

        <section>
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-500">
            Node states
          </h3>
          <ul className="flex flex-col gap-3">
            {LEGEND.map((item) => (
              <li key={item.label} className="flex items-start gap-3">
                <span
                  aria-hidden
                  className={[
                    "mt-0.5 h-4 w-4 flex-shrink-0 rounded",
                    item.dot,
                  ].join(" ")}
                />
                <span className="text-sm text-zinc-300">
                  <strong className="text-zinc-100">{item.label}</strong> —{" "}
                  {item.text}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-xl border border-edge bg-ink/40 p-4">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
            Your progress is private
          </h3>
          <p className="mt-1 text-sm text-zinc-300">
            Everything is saved locally in your browser — no account, no server.
            Use <strong>Export</strong> to back it up as a JSON file and{" "}
            <strong>Import</strong> to restore it on another device.
          </p>
        </section>
      </div>
    </div>
  );
}
