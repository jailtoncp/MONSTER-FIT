import type { ActiveWorkout } from "../types";

export interface WorkoutSetPosition { exerciseIndex: number; setIndex: number }

export function getAdjacentWorkoutSet(
  exercises: Array<{ sets: unknown[] }>,
  exerciseIndex: number,
  setIndex: number,
  direction: -1 | 1,
): WorkoutSetPosition | null {
  const positions = exercises.flatMap((exercise, eIndex) => exercise.sets.map((_, sIndex) => ({ exerciseIndex: eIndex, setIndex: sIndex })));
  const current = positions.findIndex((position) => position.exerciseIndex === exerciseIndex && position.setIndex === setIndex);
  return current < 0 ? null : positions[current + direction] ?? null;
}

export function createActiveWorkout(workoutId: string, now = Date.now()): ActiveWorkout {
  const timestamp = new Date(now).toISOString();
  return {
    workoutId,
    startedAt: timestamp,
    resumedAt: timestamp,
    elapsedSeconds: 0,
    lastCheckpointAt: timestamp,
    isPaused: false,
    exerciseIndex: 0,
    setIndex: 0,
    performed: [],
    restRemainingSeconds: null,
    restEndsAt: null,
    restPaused: false,
  };
}

export function activeWorkoutElapsedSeconds(active: ActiveWorkout, now = Date.now()): number {
  const started = Date.parse(active.startedAt);
  const accumulated = active.elapsedSeconds ?? (Number.isFinite(started) ? Math.max(0, (now - started) / 1000) : 0);
  const resumed = active.resumedAt ? Date.parse(active.resumedAt) : NaN;
  const currentSegment = !active.isPaused && Number.isFinite(resumed) ? Math.max(0, (now - resumed) / 1000) : 0;
  return Math.max(0, Math.floor(accumulated + currentSegment));
}

export function checkpointActiveWorkout(active: ActiveWorkout, now = Date.now()): ActiveWorkout {
  if (active.isPaused) return active;
  return { ...active, elapsedSeconds: activeWorkoutElapsedSeconds(active, now), lastCheckpointAt: new Date(now).toISOString() };
}

export function pauseActiveWorkout(active: ActiveWorkout, now = Date.now()): ActiveWorkout {
  if (active.isPaused) return active;
  const restEnd = active.restEndsAt ? Date.parse(active.restEndsAt) : NaN;
  const restRemainingSeconds = active.restPaused
    ? active.restRemainingSeconds ?? null
    : Number.isFinite(restEnd)
      ? Math.max(0, Math.ceil((restEnd - now) / 1000))
      : active.restRemainingSeconds ?? null;
  return {
    ...active,
    elapsedSeconds: activeWorkoutElapsedSeconds(active, now),
    lastCheckpointAt: new Date(now).toISOString(),
    isPaused: true,
    resumedAt: undefined,
    restRemainingSeconds,
    restEndsAt: null,
  };
}

export function resumeActiveWorkout(active: ActiveWorkout, now = Date.now()): ActiveWorkout {
  if (!active.isPaused) return active;
  const restRemaining = active.restRemainingSeconds ?? null;
  return {
    ...active,
    elapsedSeconds: activeWorkoutElapsedSeconds(active, now),
    isPaused: false,
    resumedAt: new Date(now).toISOString(),
    lastCheckpointAt: new Date(now).toISOString(),
    restEndsAt: restRemaining !== null && !active.restPaused
      ? new Date(now + restRemaining * 1000).toISOString()
      : null,
  };
}

/** Recover a force-closed PWA using the last persisted checkpoint, never wall-clock downtime. */
export function recoverActiveWorkout(active: ActiveWorkout, now = Date.now()): ActiveWorkout {
  if (active.isPaused) return active;
  if (active.elapsedSeconds === undefined || !active.resumedAt) {
    return { ...active, elapsedSeconds: 0, isPaused: true, resumedAt: undefined, lastCheckpointAt: new Date(now).toISOString(), restEndsAt: null };
  }
  const checkpoint = active.lastCheckpointAt ? Date.parse(active.lastCheckpointAt) : Date.parse(active.resumedAt);
  const safeCheckpoint = Number.isFinite(checkpoint) ? Math.min(now, checkpoint) : Date.parse(active.resumedAt);
  return pauseActiveWorkout(active, Number.isFinite(safeCheckpoint) ? safeCheckpoint : now);
}
