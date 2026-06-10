import type { CategoryProgress as CategoryProgressData } from "../lib/tree";

interface CategoryProgressProps {
  data: CategoryProgressData[];
}

export function CategoryProgress({ data }: CategoryProgressProps) {
  return (
    <div className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-5">
      {data.map((c) => (
        <div
          key={c.category}
          className="rounded-xl border border-edge bg-surface p-3 sm:p-4"
        >
          <div className="flex items-baseline justify-between gap-1">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400 sm:text-xs">
              {c.category}
            </span>
            <span className="text-[10px] text-zinc-500 sm:text-xs">
              {c.mastered}/{c.total}
            </span>
          </div>
          <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-edge sm:mt-3">
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
