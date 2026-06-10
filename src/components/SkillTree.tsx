import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import type { Category, Skill, SkillState } from "../data/skills";
import { SkillNode } from "./SkillNode";

interface SkillTreeProps {
  category: Category;
  skills: Skill[]; // all skills (for prerequisite lookups)
  visible: Skill[]; // skills to render in this category after filtering
  states: Record<string, SkillState>;
  selectedId: string | null;
  justMasteredId: string | null;
  onSelect: (id: string) => void;
}

interface Line {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  active: boolean;
}

/**
 * Order skills into columns by dependency depth so a progression reads
 * left-to-right. Depth = longest chain of prerequisites within this category.
 */
function columnsByDepth(visible: Skill[], all: Skill[]): Skill[][] {
  const byId = new Map(all.map((s) => [s.id, s]));
  const depthCache = new Map<string, number>();

  const depth = (id: string, seen = new Set<string>()): number => {
    if (depthCache.has(id)) return depthCache.get(id)!;
    if (seen.has(id)) return 0;
    seen.add(id);
    const skill = byId.get(id);
    if (!skill || skill.prerequisites.length === 0) {
      depthCache.set(id, 0);
      return 0;
    }
    const d =
      1 + Math.max(...skill.prerequisites.map((p) => depth(p, new Set(seen))));
    depthCache.set(id, d);
    return d;
  };

  const cols: Skill[][] = [];
  for (const skill of visible) {
    const d = depth(skill.id);
    (cols[d] ??= []).push(skill);
  }
  return cols.filter(Boolean);
}

export function SkillTree({
  category,
  skills,
  visible,
  states,
  selectedId,
  justMasteredId,
  onSelect,
}: SkillTreeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const lastSerialized = useRef<string>("");
  const [lines, setLines] = useState<Line[]>([]);

  const cols = columnsByDepth(visible, skills);

  const measure = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const base = container.getBoundingClientRect();
    const visibleIds = new Set(visible.map((s) => s.id));
    const next: Line[] = [];

    for (const skill of visible) {
      const childEl = nodeRefs.current.get(skill.id);
      if (!childEl) continue;
      const childBox = childEl.getBoundingClientRect();
      for (const prereqId of skill.prerequisites) {
        if (!visibleIds.has(prereqId)) continue;
        const parentEl = nodeRefs.current.get(prereqId);
        if (!parentEl) continue;
        const parentBox = parentEl.getBoundingClientRect();
        next.push({
          x1: parentBox.right - base.left,
          y1: parentBox.top + parentBox.height / 2 - base.top,
          x2: childBox.left - base.left,
          y2: childBox.top + childBox.height / 2 - base.top,
          active: states[prereqId] === "mastered",
        });
      }
    }

    // Only commit when the geometry actually changed, otherwise the layout
    // effect would re-run on its own setState and loop forever.
    const serialized = JSON.stringify(next);
    if (serialized !== lastSerialized.current) {
      lastSerialized.current = serialized;
      setLines(next);
    }
  }, [visible, states]);

  useLayoutEffect(() => {
    measure();
  }, [measure]);

  useEffect(() => {
    const handle = () => measure();
    window.addEventListener("resize", handle);

    // ResizeObserver catches content reflow (filtering, font load, mobile
    // address-bar resize) that a window resize listener alone would miss.
    const ro =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(handle)
        : null;
    if (ro && containerRef.current) ro.observe(containerRef.current);

    return () => {
      window.removeEventListener("resize", handle);
      ro?.disconnect();
    };
  }, [measure]);

  if (visible.length === 0) return null;

  return (
    <section className="mb-10">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-widest text-zinc-400">
        {category}
      </h3>
      {/* Outer element scrolls; inner `containerRef` grows to the full content
          width so the SVG overlay covers every node and stays aligned while the
          user pans horizontally on a small screen. */}
      <div className="-mx-5 overflow-x-auto overscroll-x-contain px-5 pb-2 [scrollbar-width:thin] [-webkit-overflow-scrolling:touch]">
        <div ref={containerRef} className="relative inline-block min-w-full">
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full"
            aria-hidden
          >
            {lines.map((l, i) => (
              <line
                key={i}
                x1={l.x1}
                y1={l.y1}
                x2={l.x2}
                y2={l.y2}
                stroke={l.active ? "#c6f432" : "#2a2a2a"}
                strokeWidth={l.active ? 2 : 1.5}
                strokeDasharray={l.active ? "0" : "4 4"}
              />
            ))}
          </svg>
          <div className="relative flex gap-6 sm:gap-10">
            {cols.map((col, ci) => (
              <div
                key={ci}
                className="flex flex-col justify-center gap-4 sm:gap-5"
              >
                {col.map((skill) => (
                <div
                  key={skill.id}
                  ref={(el) => {
                    if (el) nodeRefs.current.set(skill.id, el);
                    else nodeRefs.current.delete(skill.id);
                  }}
                >
                  <SkillNode
                    skill={skill}
                    state={states[skill.id]}
                    selected={selectedId === skill.id}
                    justMastered={justMasteredId === skill.id}
                    onSelect={onSelect}
                  />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
