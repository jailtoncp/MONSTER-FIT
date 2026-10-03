import type { BellaData, DayKey, Workout } from "../types";
import { makeId, makeWorkoutExercise } from "./catalog";

const DAY_KEYS: DayKey[] = ["seg", "ter", "qua", "qui", "sex", "sab", "dom"];

export function appendExerciseToWorkout(workout: Workout, definition: Parameters<typeof makeWorkoutExercise>[0]): Workout {
  if (workout.exercises.some((exercise) => exercise.name === definition.name)) return workout;
  return {
    ...workout,
    exercises: [...workout.exercises, makeWorkoutExercise(definition)],
    updatedAt: new Date().toISOString(),
  };
}

export function updateWorkoutSchedule(data: BellaData, next: Workout): BellaData {
  const daysTaken = new Set(next.days);
  const schedule = { ...data.schedule };
  const workouts = data.workouts.map((workout) => {
    if (workout.id === next.id) return { ...next, updatedAt: new Date().toISOString() };
    return daysTaken.size && workout.days.some((day) => daysTaken.has(day))
      ? { ...workout, days: workout.days.filter((day) => !daysTaken.has(day)) }
      : workout;
  });
  for (const day of DAY_KEYS) {
    if (next.days.includes(day)) schedule[day] = next.id;
    else if (schedule[day] === next.id) schedule[day] = null;
  }
  return { ...data, workouts, schedule };
}

export function assignScheduledWorkout(data: BellaData, day: DayKey, workoutId: string | null): BellaData {
  const workouts = data.workouts.map((workout) => {
    if (workout.id === workoutId) return workout.days.includes(day) ? workout : { ...workout, days: [...workout.days, day] };
    return workout.days.includes(day) ? { ...workout, days: workout.days.filter((item) => item !== day) } : workout;
  });
  return { ...data, workouts, schedule: { ...data.schedule, [day]: workoutId } };
}

export function duplicateWorkout(workout: Workout): Workout {
  const now = new Date().toISOString();
  return {
    ...workout,
    id: makeId("workout"),
    title: `${workout.title} — Cópia`,
    days: [],
    createdAt: now,
    updatedAt: now,
    exercises: workout.exercises.map((exercise) => ({
      ...exercise,
      id: makeId("exercise"),
      sets: exercise.sets.map((set) => ({ ...set, id: makeId("set") })),
    })),
  };
}
