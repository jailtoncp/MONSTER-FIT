import { describe, expect, it } from "vitest";
import type { ActiveWorkout, Workout } from "../types";
import {
  adjustRestTimer,
  clearRestTimer,
  getAdjacentSetPosition,
  getRemainingRestSeconds,
  startRestTimer,
  toggleRestTimerPause,
} from "./workoutRunnerService";

const active: ActiveWorkout = {
  workoutId: "w1",
  startedAt: "2026-10-07T10:00:00.000Z",
  exerciseIndex: 0,
  setIndex: 0,
  performed: [],
};

const workout = {
  exercises: [
    { sets: [{}, {}] },
    { sets: [{}] },
  ],
} as Workout;

describe("workout runner state", () => {
  it("navigates to the adjacent set even when it is already completed", () => {
    expect(getAdjacentSetPosition(workout, { exerciseIndex: 0, setIndex: 1 }, -1)).toEqual({ exerciseIndex: 0, setIndex: 0 });
    expect(getAdjacentSetPosition(workout, { exerciseIndex: 0, setIndex: 1 }, 1)).toEqual({ exerciseIndex: 1, setIndex: 0 });
    expect(getAdjacentSetPosition(workout, { exerciseIndex: 0, setIndex: 0 }, -1)).toBeNull();
    expect(getAdjacentSetPosition(workout, { exerciseIndex: 1, setIndex: 0 }, 1)).toBeNull();
  });

  it("restores a running timer from its absolute end time after a remount", () => {
    const started = startRestTimer(active, 60, 1_000_000);
    expect(started.startedAt).toBe(active.startedAt);
    expect(started.restTimerEndsAt).toBe(new Date(1_060_000).toISOString());
    expect(getRemainingRestSeconds(started, 1_020_000)).toBe(40);
    expect(getRemainingRestSeconds(started, 1_061_000)).toBe(0);
  });

  it("preserves remaining time when paused and resumes from that point", () => {
    const running = startRestTimer(active, 60, 1_000_000);
    const paused = toggleRestTimerPause(running, 1_020_000);
    expect(paused.restTimerEndsAt).toBeNull();
    expect(paused.restPausedSeconds).toBe(40);
    expect(getRemainingRestSeconds(paused, 1_080_000)).toBe(40);

    const resumed = toggleRestTimerPause(paused, 1_080_000);
    expect(resumed.restPausedSeconds).toBeNull();
    expect(resumed.restTimerEndsAt).toBe(new Date(1_120_000).toISOString());
  });

  it("adjusts the persisted countdown and clears it when the user skips rest", () => {
    const running = startRestTimer(active, 30, 1_000_000);
    const adjusted = adjustRestTimer(running, 15, 1_010_000);
    expect(getRemainingRestSeconds(adjusted, 1_010_000)).toBe(35);
    expect(getRemainingRestSeconds(clearRestTimer(adjusted), 1_010_000)).toBeNull();
  });
});
