import type { BellaData, DayKey, Workout } from "../types";

const WEEKDAYS: DayKey[] = ["dom", "seg", "ter", "qua", "qui", "sex", "sab"];

export function localDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function getDailyWorkoutReminder(data: BellaData, now = new Date()): Workout | null {
  const today = localDateKey(now);
  const completedToday = data.history.some((session) => {
    const finishedAt = new Date(session.finishedAt);
    return !Number.isNaN(finishedAt.getTime()) && localDateKey(finishedAt) === today;
  });
  if (completedToday) return null;
  const workoutId = data.schedule[WEEKDAYS[now.getDay()]];
  return workoutId ? data.workouts.find((workout) => workout.id === workoutId) ?? null : null;
}

export function reminderStorageKey(accountId: string, now = new Date()): string {
  return `monster-fit:reminder:v1:${accountId}:${localDateKey(now)}`;
}
