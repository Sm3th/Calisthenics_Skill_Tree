import { beforeEach, describe, expect, it } from "vitest";
import {
  clearProgress,
  exportProgress,
  importProgress,
  loadProgress,
  saveProgress,
} from "../src/lib/storage";
import type { ProgressMap } from "../src/lib/tree";

describe("storage round-trip", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("save then load returns the same state", () => {
    const state: ProgressMap = { pushup: "mastered", lsit: "in_progress" };
    saveProgress(state);
    expect(loadProgress()).toEqual(state);
  });

  it("returns an empty map when nothing is stored", () => {
    expect(loadProgress()).toEqual({});
  });

  it("clear removes stored progress", () => {
    saveProgress({ pushup: "mastered" });
    clearProgress();
    expect(loadProgress()).toEqual({});
  });

  it("ignores corrupt JSON in storage", () => {
    localStorage.setItem("calisthenics-skill-tree:progress:v1", "{not json");
    expect(loadProgress()).toEqual({});
  });
});

describe("export / import round-trip", () => {
  it("import(export(state)) equals the original state", () => {
    const state: ProgressMap = {
      pushup: "mastered",
      dip: "in_progress",
      pullup: "mastered",
    };
    const json = exportProgress(state);
    expect(importProgress(json)).toEqual(state);
  });

  it("drops malformed entries on import", () => {
    const json = JSON.stringify({
      good: "mastered",
      bad: "not-a-real-mark",
      alsoBad: 42,
    });
    expect(importProgress(json)).toEqual({ good: "mastered" });
  });

  it("throws on invalid JSON input", () => {
    expect(() => importProgress("{nope")).toThrow();
  });
});
