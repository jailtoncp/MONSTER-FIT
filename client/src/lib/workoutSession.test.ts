import { describe, expect, it } from "vitest";
import { activeWorkoutElapsedSeconds, createActiveWorkout, getAdjacentWorkoutSet, pauseActiveWorkout, recoverActiveWorkout, resumeActiveWorkout } from "./workoutSession";

describe("workout session checkpoints", () => {
  it("stores elapsed active time and excludes time spent away", () => {
    const started = createActiveWorkout("workout-1", 1_000_000);
    const paused = pauseActiveWorkout(started, 1_045_000);
    expect(paused.elapsedSeconds).toBe(45);
    expect(paused.isPaused).toBe(true);
    expect(activeWorkoutElapsedSeconds(paused, 1_645_000)).toBe(45);
    const resumed = resumeActiveWorkout(paused, 1_645_000);
    expect(activeWorkoutElapsedSeconds(resumed, 1_653_000)).toBe(53);
  });

  it("keeps the exact rest seconds remaining when pausing and rebuilds its deadline on resume", () => {
    const now = 2_000_000;
    const active = {
      ...createActiveWorkout("workout-1", now),
      exerciseIndex: 1,
      setIndex: 2,
      performed: [{ exerciseIndex: 1, setIndex: 1, exerciseName: "Agachamento", reps: "10", weight: "20", method: "Repetições" as const, seconds: 0, completedAt: new Date(now).toISOString() }],
      restRemainingSeconds: 60,
      restEndsAt: new Date(now + 60_000).toISOString(),
    };
    const paused = pauseActiveWorkout(active, now + 20_000);
    expect(paused.restRemainingSeconds).toBe(40);
    expect(paused.restEndsAt).toBeNull();
    expect(paused.exerciseIndex).toBe(1);
    expect(paused.setIndex).toBe(2);
    expect(paused.performed).toHaveLength(1);
    const resumed = resumeActiveWorkout(paused, now + 1_000_000);
    expect(Date.parse(resumed.restEndsAt!)).toBe(now + 1_040_000);
  });

  it("preserves a manually paused rest timer when the whole workout resumes", () => {
    const paused = pauseActiveWorkout({
      ...createActiveWorkout("workout-1", 3_000_000),
      restRemainingSeconds: 25,
      restPaused: true,
    }, 3_010_000);
    const resumed = resumeActiveWorkout(paused, 4_000_000);
    expect(resumed.restRemainingSeconds).toBe(25);
    expect(resumed.restPaused).toBe(true);
    expect(resumed.restEndsAt).toBeNull();
  });

  it("keeps backwards compatibility with an active workout saved before checkpoint fields existed", () => {
    const legacy = { workoutId: "old", startedAt: new Date(5_000_000).toISOString(), exerciseIndex: 0, setIndex: 1, performed: [] };
    expect(pauseActiveWorkout(legacy, 5_030_000).elapsedSeconds).toBe(30);
  });

  it("recovers from a forced app close using only time through the last saved checkpoint", () => {
    const start = 6_000_000;
    const active = { ...createActiveWorkout("workout-1", start), lastCheckpointAt: new Date(start + 45_000).toISOString() };
    const recovered = recoverActiveWorkout(active, start + 3_600_000);
    expect(recovered.elapsedSeconds).toBe(45);
    expect(recovered.isPaused).toBe(true);
    expect(activeWorkoutElapsedSeconds(recovered, start + 3_600_000)).toBe(45);
  });

  it("navigates back through completed sets, including across exercises", () => {
    const exercises = [{ sets: [{}, {}] }, { sets: [{}] }];
    expect(getAdjacentWorkoutSet(exercises, 1, 0, -1)).toEqual({ exerciseIndex: 0, setIndex: 1 });
    expect(getAdjacentWorkoutSet(exercises, 0, 1, -1)).toEqual({ exerciseIndex: 0, setIndex: 0 });
    expect(getAdjacentWorkoutSet(exercises, 0, 0, -1)).toBeNull();
  });
});
