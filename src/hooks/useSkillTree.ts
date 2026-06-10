import { useCallback, useEffect, useMemo, useState } from "react";
import { SKILLS, type Skill } from "../data/skills";
import {
  categoryProgress,
  computeStates,
  overallProgress,
  recommendedNext,
  setSkillMark,
  toggleSkill,
  type ProgressMap,
  type ProgressMark,
} from "../lib/tree";
import {
  clearProgress,
  exportProgress,
  importProgress,
  loadProgress,
  saveProgress,
} from "../lib/storage";

export function useSkillTree(skills: Skill[] = SKILLS) {
  const [progress, setProgress] = useState<ProgressMap>(() => loadProgress());

  // Persist on every change.
  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  const states = useMemo(
    () => computeStates(skills, progress),
    [skills, progress]
  );

  const categories = useMemo(
    () => categoryProgress(skills, progress),
    [skills, progress]
  );

  const overall = useMemo(
    () => overallProgress(skills, progress),
    [skills, progress]
  );

  const recommended = useMemo(
    () => recommendedNext(skills, progress),
    [skills, progress]
  );

  const toggle = useCallback(
    (id: string) => setProgress((p) => toggleSkill(skills, p, id)),
    [skills]
  );

  const setMark = useCallback(
    (id: string, mark: ProgressMark | null) =>
      setProgress((p) => setSkillMark(p, id, mark)),
    []
  );

  const reset = useCallback(() => {
    clearProgress();
    setProgress({});
  }, []);

  const exportJson = useCallback(() => exportProgress(progress), [progress]);

  const importJson = useCallback((json: string) => {
    setProgress(importProgress(json));
  }, []);

  return {
    skills,
    progress,
    states,
    categories,
    overall,
    recommended,
    toggle,
    setMark,
    reset,
    exportJson,
    importJson,
  };
}
