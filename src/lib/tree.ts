import {
  CATEGORIES,
  type Category,
  type Skill,
  type SkillState,
} from "../data/skills";

/**
 * The user only ever explicitly controls whether a skill is "in_progress" or
 * "mastered". `locked` and `available` are derived from prerequisites. We store
 * the user's intent as a map of skill id -> "in_progress" | "mastered".
 */
export type ProgressMark = "in_progress" | "mastered";
export type ProgressMap = Record<string, ProgressMark>;

/**
 * Compute the displayed state for every skill given the user's progress marks.
 *
 * Rules:
 * - A skill is `mastered` if the user marked it mastered.
 * - Otherwise it is `locked` if any prerequisite is not yet mastered.
 * - Otherwise (all prerequisites mastered, or none) it is `available`, unless
 *   the user marked it `in_progress`.
 * - Root skills (no prerequisites) start `available`.
 *
 * Because state is derived fresh from the marks on every call, locking a skill
 * (removing its mastered mark) automatically re-locks everything downstream.
 */
export function computeStates(
  skills: Skill[],
  progress: ProgressMap
): Record<string, SkillState> {
  const byId = new Map(skills.map((s) => [s.id, s]));
  const result: Record<string, SkillState> = {};

  // A skill counts as *effectively* mastered only if the user marked it
  // mastered AND every prerequisite is itself effectively mastered. This is
  // what makes locking cascade: removing a mark mid-chain re-locks everything
  // downstream, even nodes the user had previously marked mastered.
  const masteryCache = new Map<string, boolean>();
  const isMastered = (id: string, seen = new Set<string>()): boolean => {
    if (masteryCache.has(id)) return masteryCache.get(id)!;
    if (seen.has(id)) return false; // guard against cycles
    seen.add(id);
    const skill = byId.get(id);
    if (!skill || progress[id] !== "mastered") {
      masteryCache.set(id, false);
      return false;
    }
    const value = skill.prerequisites.every((p) =>
      isMastered(p, new Set(seen))
    );
    masteryCache.set(id, value);
    return value;
  };

  const prereqsMet = (skill: Skill): boolean =>
    skill.prerequisites.every((p) => byId.has(p) && isMastered(p));

  for (const skill of skills) {
    if (isMastered(skill.id)) {
      result[skill.id] = "mastered";
    } else if (!prereqsMet(skill)) {
      result[skill.id] = "locked";
    } else if (progress[skill.id] === "in_progress") {
      result[skill.id] = "in_progress";
    } else {
      result[skill.id] = "available";
    }
  }

  return result;
}

/**
 * Cycle a single skill through its user-controllable states:
 *   available -> in_progress -> mastered -> available (reset)
 * Locked skills cannot be toggled and are returned unchanged.
 */
export function toggleSkill(
  skills: Skill[],
  progress: ProgressMap,
  id: string
): ProgressMap {
  const states = computeStates(skills, progress);
  const current = states[id];
  const next: ProgressMap = { ...progress };

  switch (current) {
    case "available":
      next[id] = "in_progress";
      break;
    case "in_progress":
      next[id] = "mastered";
      break;
    case "mastered":
      delete next[id];
      break;
    case "locked":
    default:
      // no-op: cannot interact with a locked skill
      break;
  }

  return next;
}

/** Directly set a skill to a specific mark (or clear it with `null`). */
export function setSkillMark(
  progress: ProgressMap,
  id: string,
  mark: ProgressMark | null
): ProgressMap {
  const next: ProgressMap = { ...progress };
  if (mark === null) {
    delete next[id];
  } else {
    next[id] = mark;
  }
  return next;
}

export interface CategoryProgress {
  category: Category;
  mastered: number;
  total: number;
  percent: number;
}

/** Per-category mastered counts and percentage. */
export function categoryProgress(
  skills: Skill[],
  progress: ProgressMap
): CategoryProgress[] {
  const states = computeStates(skills, progress);
  return CATEGORIES.map((category) => {
    const inCategory = skills.filter((s) => s.category === category);
    const mastered = inCategory.filter(
      (s) => states[s.id] === "mastered"
    ).length;
    const total = inCategory.length;
    const percent = total === 0 ? 0 : Math.round((mastered / total) * 100);
    return { category, mastered, total, percent };
  });
}

export interface OverallProgress {
  mastered: number;
  total: number;
  percent: number;
}

/** Overall mastered count across all skills. */
export function overallProgress(
  skills: Skill[],
  progress: ProgressMap
): OverallProgress {
  const states = computeStates(skills, progress);
  const total = skills.length;
  const mastered = skills.filter(
    (s) => states[s.id] === "mastered"
  ).length;
  const percent = total === 0 ? 0 : Math.round((mastered / total) * 100);
  return { mastered, total, percent };
}

/**
 * Suggest the next skill to chase: the lowest-difficulty `available` skill,
 * breaking ties by how many skills it unlocks downstream. Returns null when
 * nothing is available (everything mastered or locked).
 */
export function recommendedNext(
  skills: Skill[],
  progress: ProgressMap
): Skill | null {
  const states = computeStates(skills, progress);
  const available = skills.filter(
    (s) => states[s.id] === "available" || states[s.id] === "in_progress"
  );
  if (available.length === 0) return null;

  const unlockCount = (id: string): number =>
    skills.filter((s) => s.prerequisites.includes(id)).length;

  return [...available].sort((a, b) => {
    if (a.difficulty !== b.difficulty) return a.difficulty - b.difficulty;
    return unlockCount(b.id) - unlockCount(a.id);
  })[0];
}
