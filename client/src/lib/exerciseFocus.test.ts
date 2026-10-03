import { describe, expect, it } from "vitest";
import { EXERCISE_FOCUS } from "./exerciseFocus";
import { EXERCISE_CATALOG } from "./catalog";

describe("technical focus for the exercise library", () => {
  it("describes every standard exercise with a purpose and primary muscles", () => {
    const catalogIds = new Set(EXERCISE_CATALOG.map((exercise) => exercise.id));
    expect(EXERCISE_CATALOG.length).toBeGreaterThan(70);
    expect(Object.keys(EXERCISE_FOCUS).every((id) => catalogIds.has(id))).toBe(true);
    for (const exercise of EXERCISE_CATALOG) {
      expect(exercise.purpose?.trim(), `${exercise.name} needs a technical purpose`).toBeTruthy();
      expect(exercise.primaryMuscles?.length, `${exercise.name} needs a primary target`).toBeGreaterThan(0);
      expect(Array.isArray(exercise.secondaryMuscles), `${exercise.name} needs a secondary-target list`).toBe(true);
      expect(exercise.primaryMuscles).not.toEqual(expect.arrayContaining([""]));
      expect(exercise.secondaryMuscles).not.toEqual(expect.arrayContaining([""]));
    }
    expect(EXERCISE_CATALOG.map((exercise) => exercise.equipment)).toEqual(expect.arrayContaining(["Máquina", "Barra", "Halteres", "Elástico", "Peso corporal", "Caneleira"]));
  });

  it("distinguishes chest press from hip flexion in technical labels", () => {
    expect(EXERCISE_FOCUS.supino.primaryMuscles).toContain("Peitoral maior");
    expect(EXERCISE_FOCUS["elevacao-pernas"].primaryMuscles).toContain("Iliopsoas");
    expect(EXERCISE_FOCUS["elevacao-pernas"].secondaryMuscles).toContain("Reto abdominal");
  });

  it("adds three fully described cardio movements with their own demonstration GIFs", () => {
    const cardio = EXERCISE_CATALOG.filter((exercise) => exercise.muscle === "Condicionamento");
    expect(cardio.map((exercise) => exercise.id)).toEqual(expect.arrayContaining(["burpee", "pular-corda", "corrida-estacionaria"]));
    for (const exercise of cardio.filter((exercise) => ["burpee", "pular-corda", "corrida-estacionaria"].includes(exercise.id))) {
      expect(exercise.imageUrl, `${exercise.name} needs its own GIF`).toBeTruthy();
      expect(exercise.purpose).toBeTruthy();
      expect(exercise.primaryMuscles?.length).toBeGreaterThan(0);
    }
  });
});
