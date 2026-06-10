import type { ProgressMap, ProgressMark } from "./tree";

const STORAGE_KEY = "calisthenics-skill-tree:progress:v1";

const VALID_MARKS: ProgressMark[] = ["in_progress", "mastered"];

/** Keep only well-formed entries so a corrupt payload can't poison state. */
function sanitize(input: unknown): ProgressMap {
  if (typeof input !== "object" || input === null) return {};
  const result: ProgressMap = {};
  for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
    if (
      typeof key === "string" &&
      typeof value === "string" &&
      (VALID_MARKS as string[]).includes(value)
    ) {
      result[key] = value as ProgressMark;
    }
  }
  return result;
}

export function loadProgress(): ProgressMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return sanitize(JSON.parse(raw));
  } catch {
    return {};
  }
}

export function saveProgress(progress: ProgressMap): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Storage may be unavailable (private mode, quota). Fail silently.
  }
}

export function clearProgress(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

/** Serialize progress to a pretty JSON string for download. */
export function exportProgress(progress: ProgressMap): string {
  return JSON.stringify(progress, null, 2);
}

/**
 * Parse an imported JSON string back into a ProgressMap, discarding any
 * malformed entries. Throws if the string is not valid JSON.
 */
export function importProgress(json: string): ProgressMap {
  const parsed = JSON.parse(json);
  return sanitize(parsed);
}
