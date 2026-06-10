import type { CategoryProgress as CategoryProgressData } from "../lib/tree";

interface CategoryProgressProps {
  data: CategoryProgressData[];
}

export function CategoryProgress({ data }: CategoryProgressProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
      {data.map((c) => (
        <div
          key={c.category}
          className="rounded-xl border border-edge bg-surface p-4"
        >
          <div className="flex items-baseline justify-between">
            <span className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
              {c.category}
            </span>
            <span className="text-xs text-zinc-500">
              {c.mastered}/{c.total}
            </span>
          </div>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-edge">
            <div
              className="h-full rounded-full bg-lime transition-all duration-500"
              style={{ width: `${c.percent}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
