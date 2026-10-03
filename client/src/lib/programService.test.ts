import { describe, expect, it } from "vitest";
import { createInitialData } from "./storageService";
import { appendExerciseToWorkout, assignScheduledWorkout, duplicateWorkout, updateWorkoutSchedule } from "./programService";

describe("Monster Fit schedule and workout helpers", () => {
  it("keeps workout weekday labels synchronized when changing days in the editor", () => {
    const data = createInitialData("QA", "qa@example.com");
    const [first, second] = data.workouts;
    const next = { ...first, days: ["ter" as const, "qua" as const] };
    const result = updateWorkoutSchedule(data, next);
    expect(result.schedule.seg).toBeNull();
    expect(result.schedule.ter).toBe(first.id);
    expect(result.schedule.qua).toBe(first.id);
    expect(result.workouts.find((item) => item.id === first.id)?.days).toEqual(["ter", "qua"]);
    expect(result.workouts.find((item) => item.id === second.id)?.days).not.toContain("qua");
  });

  it("moves a day assignment across routines and clears both representations", () => {
    const data = createInitialData("QA", "qa@example.com");
    const [first, second] = data.workouts;
    const moved = assignScheduledWorkout(data, "seg", second.id);
    expect(moved.schedule.seg).toBe(second.id);
    expect(moved.workouts.find((item) => item.id === first.id)?.days).not.toContain("seg");
    expect(moved.workouts.find((item) => item.id === second.id)?.days).toContain("seg");
    const cleared = assignScheduledWorkout(moved, "seg", null);
    expect(cleared.schedule.seg).toBeNull();
    expect(cleared.workouts.some((item) => item.days.includes("seg"))).toBe(false);
  });

  it("duplicates the routine with new ids and independent sets, without copying its calendar days", () => {
    const data = createInitialData("QA", "qa@example.com");
    const original = data.workouts[0];
    const copy = duplicateWorkout(original);
    expect(copy.id).not.toBe(original.id);
    expect(copy.title).toBe(`${original.title} — Cópia`);
    expect(copy.days).toEqual([]);
    expect(copy.exercises.map((item) => item.id)).not.toContain(original.exercises[0].id);
    expect(copy.exercises[0].sets[0].id).not.toBe(original.exercises[0].sets[0].id);
    copy.exercises[0].sets[0].weight = "99";
    expect(original.exercises[0].sets[0].weight).not.toBe("99");
  });
});


describe("unlimited workout exercises", () => {
  it("adds more than seven distinct exercises and keeps duplicate names from being added twice", () => {
    const data = createInitialData("QA", "qa@example.com");
    const original = data.workouts[0];
    const definitions = Array.from({ length: 12 }, (_, index) => ({
      id: `qa-exercise-${index + 1}`,
      name: `Movimento QA ${index + 1}`,
      muscle: "Pernas",
      equipment: "Halter",
      description: "Movimento de teste.",
      instructions: "Execute com controle.",
      defaultSets: 3,
      defaultReps: "12",
      defaultRestSeconds: 60,
    }));
    const expanded = definitions.reduce((workout, definition) => appendExerciseToWorkout(workout, definition), original);

    expect(expanded.exercises).toHaveLength(original.exercises.length + 12);
    expect(expanded.exercises.length).toBeGreaterThan(7);
    expect(appendExerciseToWorkout(expanded, definitions[0])).toBe(expanded);
    expect(original.exercises).toHaveLength(4);
    expect(expanded.exercises.at(-1)?.sets).toHaveLength(3);
  });
});
