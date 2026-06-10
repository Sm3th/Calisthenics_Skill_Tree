import { useMemo, useRef, useState } from "react";
import { CATEGORIES, type Category, type Skill } from "./data/skills";
import { useSkillTree } from "./hooks/useSkillTree";
import { Header } from "./components/Header";
import { SearchFilter } from "./components/SearchFilter";
import { CategoryProgress } from "./components/CategoryProgress";
import { SkillTree } from "./components/SkillTree";
import { SkillDetailPanel } from "./components/SkillDetailPanel";

export default function App() {
  const {
    skills,
    states,
    categories,
    overall,
    recommended,
    setMark,
    reset,
    exportJson,
    importJson,
  } = useSkillTree();

  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<Category | "All">("All");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [justMasteredId, setJustMasteredId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return skills.filter((s) => {
      const matchesQuery = q === "" || s.name.toLowerCase().includes(q);
      const matchesCategory =
        activeCategory === "All" || s.category === activeCategory;
      return matchesQuery && matchesCategory;
    });
  }, [skills, query, activeCategory]);

  const selectedSkill = skills.find((s) => s.id === selectedId) ?? null;

  const prerequisites = useMemo(() => {
    if (!selectedSkill) return [];
    return selectedSkill.prerequisites
      .map((id) => skills.find((s) => s.id === id))
      .filter((s): s is Skill => Boolean(s))
      .map((s) => ({ skill: s, state: states[s.id] }));
  }, [selectedSkill, skills, states]);

  const visibleCategories = CATEGORIES.filter((cat) =>
    filtered.some((s) => s.category === cat)
  );

  const handleSetMark = (id: string, mark: "in_progress" | "mastered" | null) => {
    if (mark === "mastered" && states[id] !== "mastered") {
      setJustMasteredId(id);
      window.setTimeout(() => setJustMasteredId(null), 650);
    }
    setMark(id, mark);
  };

  const handleExport = () => {
    const blob = new Blob([exportJson()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "calisthenics-progress.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => fileInputRef.current?.click();

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        importJson(String(reader.result));
      } catch {
        window.alert("Could not import that file — it isn't valid JSON.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleReset = () => {
    if (
      window.confirm(
        "Reset all progress? This clears every mastered and in-progress skill."
      )
    ) {
      reset();
      setSelectedId(null);
    }
  };

  return (
    <div className="min-h-full">
      <Header
        overall={overall}
        recommended={recommended}
        onExport={handleExport}
        onImport={handleImportClick}
        onReset={handleReset}
        onRecommendedClick={setSelectedId}
      />

      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={handleImportFile}
        data-testid="import-input"
      />

      <main className="mx-auto max-w-6xl px-5 py-8">
        <CategoryProgress data={categories} />

        <div className="my-8">
          <SearchFilter
            query={query}
            activeCategory={activeCategory}
            onQueryChange={setQuery}
            onCategoryChange={setActiveCategory}
          />
        </div>

        {visibleCategories.length === 0 ? (
          <p className="py-16 text-center text-zinc-500">
            No skills match your search.
          </p>
        ) : (
          visibleCategories.map((cat) => (
            <SkillTree
              key={cat}
              category={cat}
              skills={skills}
              visible={filtered.filter((s) => s.category === cat)}
              states={states}
              selectedId={selectedId}
              justMasteredId={justMasteredId}
              onSelect={setSelectedId}
            />
          ))
        )}
      </main>

      <footer className="border-t border-edge py-8 text-center text-xs text-zinc-600">
        Built with React, TypeScript &amp; Tailwind · Progress saved locally in
        your browser
      </footer>

      <SkillDetailPanel
        skill={selectedSkill}
        state={selectedSkill ? states[selectedSkill.id] : undefined}
        prerequisites={prerequisites}
        onClose={() => setSelectedId(null)}
        onSetMark={handleSetMark}
      />
    </div>
  );
}
