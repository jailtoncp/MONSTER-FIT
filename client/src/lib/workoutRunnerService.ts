import type { ActiveWorkout, Workout } from "../types";

export type SetPosition = Pick<ActiveWorkout, "exerciseIndex" | "setIndex">;
export type RestTimerState = Pick<ActiveWorkout, "restTimerEndsAt" | "restPausedSeconds">;

export function getAdjacentSetPosition(
  workout: Pick<Workout, "exercises">,
  current: SetPosition,
  direction: -1 | 1,
): SetPosition | null {
  const positions = workout.exercises.flatMap((exercise, exerciseIndex) =>
    exercise.sets.map((_, setIndex) => ({ exerciseIndex, setIndex })),
  );
  const currentIndex = positions.findIndex(
    (position) =>
      position.exerciseIndex === current.exerciseIndex &&
      position.setIndex === current.setIndex,
  );
  if (currentIndex < 0) return null;
  return positions[currentIndex + direction] ?? null;
}

export function getRemainingRestSeconds(
  active: RestTimerState | null | undefined,
  now = Date.now(),
): number | null {
  if (!active) return null;
  if (active.restPausedSeconds !== null && active.restPausedSeconds !== undefined) {
    return Math.max(0, Math.ceil(active.restPausedSeconds));
  }
  if (!active.restTimerEndsAt) return null;
  const endsAt = Date.parse(active.restTimerEndsAt);
  if (!Number.isFinite(endsAt)) return null;
  return Math.max(0, Math.ceil((endsAt - now) / 1000));
}

export function clearRestTimer<T extends ActiveWorkout>(active: T): T {
  return { ...active, restTimerEndsAt: null, restPausedSeconds: null };
}

export function startRestTimer<T extends ActiveWorkout>(
  active: T,
  seconds: number,
  now = Date.now(),
): T {
  return {
    ...active,
    restTimerEndsAt: new Date(now + Math.max(0, seconds) * 1000).toISOString(),
    restPausedSeconds: null,
  };
}

export function toggleRestTimerPause<T extends ActiveWorkout>(
  active: T,
  now = Date.now(),
): T {
  if (active.restPausedSeconds !== null && active.restPausedSeconds !== undefined) {
    return {
      ...active,
      restTimerEndsAt: new Date(now + active.restPausedSeconds * 1000).toISOString(),
      restPausedSeconds: null,
    };
  }
  const remaining = getRemainingRestSeconds(active, now);
  if (remaining === null) return active;
  if (remaining === 0) return clearRestTimer(active);
  return { ...active, restTimerEndsAt: null, restPausedSeconds: remaining };
}

export function adjustRestTimer<T extends ActiveWorkout>(
  active: T,
  deltaSeconds: number,
  now = Date.now(),
): T {
  const remaining = getRemainingRestSeconds(active, now) ?? 0;
  return startRestTimer(active, Math.max(0, remaining + deltaSeconds), now);
}
