import { CATEGORIES, type Category } from "../data/skills";

interface SearchFilterProps {
  query: string;
  activeCategory: Category | "All";
  onQueryChange: (value: string) => void;
  onCategoryChange: (value: Category | "All") => void;
}

export function SearchFilter({
  query,
  activeCategory,
  onQueryChange,
  onCategoryChange,
}: SearchFilterProps) {
  const options: (Category | "All")[] = ["All", ...CATEGORIES];

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="relative w-full md:max-w-xs">
        <span
          aria-hidden
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
        >
          🔍
        </span>
        <input
          type="search"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search skills..."
          aria-label="Search skills"
          className="w-full rounded-lg border border-edge bg-surface py-2 pl-9 pr-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-500 focus:outline-none"
        />
      </div>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onCategoryChange(opt)}
            aria-pressed={activeCategory === opt}
            className={[
              "rounded-full border px-3 py-1.5 text-xs font-medium transition",
              activeCategory === opt
                ? "border-lime bg-lime text-ink"
                : "border-edge text-zinc-400 hover:border-zinc-500 hover:text-zinc-100",
            ].join(" ")}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
