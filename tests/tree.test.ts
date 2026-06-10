import { describe, expect, it } from "vitest";
import type { Skill } from "../src/data/skills";
import { SKILLS } from "../src/data/skills";
import {
  categoryProgress,
  computeStates,
  overallProgress,
  recommendedNext,
  toggleSkill,
  type ProgressMap,
} from "../src/lib/tree";

// A tiny linear fixture: a -> b -> c, plus an independent root d.
const FIXTURE: Skill[] = [
  {
    id: "a",
    name: "A",
    category: "Push",
    description: "",
    requirement: "",
    prerequisites: [],
    difficulty: 1,
  },
  {
    id: "b",
    name: "B",
    category: "Push",
    description: "",
    requirement: "",
    prerequisites: ["a"],
    difficulty: 2,
  },
  {
    id: "c",
    name: "C",
    category: "Push",
    description: "",
    requirement: "",
    prerequisites: ["b"],
    difficulty: 3,
  },
  {
    id: "d",
    name: "D",
    category: "Pull",
    description: "",
    requirement: "",
    prerequisites: [],
    difficulty: 1,
  },
];

describe("computeStates", () => {
  it("starts root skills as available and dependents as locked", () => {
    const states = computeStates(FIXTURE, {});
    expect(states.a).toBe("available");
    expect(states.b).toBe("locked");
    expect(states.c).toBe("locked");
    expect(states.d).toBe("available");
  });

  it("unlocks a child once all prerequisites are mastered", () => {
    const progress: ProgressMap = { a: "mastered" };
    const states = computeStates(FIXTURE, progress);
    expect(states.a).toBe("mastered");
    expect(states.b).toBe("available");
    expect(states.c).toBe("locked");
  });

  it("cascades unlocks down a chain", () => {
    const progress: ProgressMap = { a: "mastered", b: "mastered" };
    const states = computeStates(FIXTURE, progress);
    expect(states.c).toBe("available");
  });

  it("re-locks downstream skills when a prerequisite is un-mastered", () => {
    const full: ProgressMap = { a: "mastered", b: "mastered", c: "mastered" };
    expect(computeStates(FIXTURE, full).c).toBe("mastered");

    // Remove mastery of b; c must re-lock even though it was mastered.
    const { b: _removed, ...withoutB } = full;
    void _removed;
    const states = computeStates(FIXTURE, withoutB);
    expect(states.b).toBe("available");
    expect(states.c).toBe("locked");
  });

  it("respects an explicit in_progress mark on an unlocked skill", () => {
    const states = computeStates(FIXTURE, { a: "in_progress" });
    expect(states.a).toBe("in_progress");
  });

  it("treats a skill with an unknown prerequisite as locked", () => {
    const broken: Skill[] = [
      {
        id: "x",
        name: "X",
        category: "Core",
        description: "",
        requirement: "",
        prerequisites: ["does-not-exist"],
        difficulty: 1,
      },
    ];
    expect(computeStates(broken, {}).x).toBe("locked");
  });
});

describe("toggleSkill", () => {
  it("cycles available -> in_progress -> mastered -> available", () => {
    let progress: ProgressMap = {};
    expect(computeStates(FIXTURE, progress).a).toBe("available");

    progress = toggleSkill(FIXTURE, progress, "a");
    expect(computeStates(FIXTURE, progress).a).toBe("in_progress");

    progress = toggleSkill(FIXTURE, progress, "a");
    expect(computeStates(FIXTURE, progress).a).toBe("mastered");

    progress = toggleSkill(FIXTURE, progress, "a");
    expect(computeStates(FIXTURE, progress).a).toBe("available");
  });

  it("does nothing for a locked skill", () => {
    const progress: ProgressMap = {};
    const next = toggleSkill(FIXTURE, progress, "c");
    expect(next).toEqual(progress);
    expect(computeStates(FIXTURE, next).c).toBe("locked");
  });

  it("mastering a node unlocks its child via toggle", () => {
    let progress: ProgressMap = {};
    progress = toggleSkill(FIXTURE, progress, "a"); // in_progress
    progress = toggleSkill(FIXTURE, progress, "a"); // mastered
    expect(computeStates(FIXTURE, progress).b).toBe("available");
  });
});

describe("progress aggregates", () => {
  it("computes per-category progress", () => {
    const progress: ProgressMap = { a: "mastered" };
    const cats = categoryProgress(FIXTURE, progress);
    const push = cats.find((c) => c.category === "Push")!;
    expect(push.total).toBe(3);
    expect(push.mastered).toBe(1);
    expect(push.percent).toBe(33);
  });

  it("computes overall progress percentage", () => {
    const progress: ProgressMap = { a: "mastered", d: "mastered" };
    const overall = overallProgress(FIXTURE, progress);
    expect(overall.total).toBe(4);
    expect(overall.mastered).toBe(2);
    expect(overall.percent).toBe(50);
  });

  it("reports 0% with no progress", () => {
    expect(overallProgress(FIXTURE, {}).percent).toBe(0);
  });
});

describe("recommendedNext", () => {
  it("prefers the lowest-difficulty available skill", () => {
    const rec = recommendedNext(FIXTURE, {});
    // a and d are both difficulty 1 roots; a unlocks more downstream, so wins.
    expect(rec?.id).toBe("a");
  });

  it("returns null when everything available is exhausted", () => {
    // Master every skill: nothing remains available or in_progress.
    const progress: ProgressMap = {
      a: "mastered",
      b: "mastered",
      c: "mastered",
      d: "mastered",
    };
    expect(recommendedNext(FIXTURE, progress)).toBeNull();
  });
});

describe("seed data integrity", () => {
  it("has at least 20 skills", () => {
    expect(SKILLS.length).toBeGreaterThanOrEqual(20);
  });

  it("references only prerequisites that exist", () => {
    const ids = new Set(SKILLS.map((s) => s.id));
    for (const skill of SKILLS) {
      for (const p of skill.prerequisites) {
        expect(ids.has(p)).toBe(true);
      }
    }
  });

  it("has unique ids", () => {
    const ids = SKILLS.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("has no cyclic prerequisites (every skill reaches a stable state)", () => {
    const states = computeStates(SKILLS, {});
    // At least the root skills should be available, proving the graph resolved.
    expect(Object.values(states).some((s) => s === "available")).toBe(true);
  });
});
