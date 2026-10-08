export type PageId = "home" | "workouts" | "editor" | "library" | "taf" | "coach" | "favorites" | "history" | "calendar" | "evolution" | "profile" | "settings" | "runner";
export type TafUnit = "reps" | "m" | "cm" | "s";
export type DayKey = "seg" | "ter" | "qua" | "qui" | "sex" | "sab" | "dom";
export type TrainingMethod = "Repetições" | "Tempo" | "Falha" | "Até a falha" | "Isometria";
export type Goal = "Hipertrofia" | "Emagrecimento" | "Força" | "Condicionamento" | "Manutenção";

export interface Account {
  id: string;
  email: string;
  name: string;
}

export interface ExerciseDefinition {
  id: string;
  name: string;
  muscle: string;
  equipment: string;
  description: string;
  instructions: string;
  defaultSets: number;
  defaultReps: string;
  defaultRestSeconds: number;
  purpose?: string;
  primaryMuscles?: string[];
  secondaryMuscles?: string[];
  imageUrl?: string;
  custom?: boolean;
}

export interface ExerciseSet {
  id: string;
  reps: string;
  weight: string;
  method: TrainingMethod;
  seconds: number;
}

export interface WorkoutExercise extends ExerciseDefinition {
  sets: ExerciseSet[];
  restSeconds: number;
  note: string;
}

export interface Workout {
  id: string;
  title: string;
  description: string;
  days: DayKey[];
  color: string;
  exercises: WorkoutExercise[];
  createdAt: string;
  updatedAt: string;
}

export interface Profile {
  name: string;
  email: string;
  age: string;
  heightCm: string;
  weightKg: string;
  goal: Goal;
  avatarDataUrl?: string;
}

export interface Settings {
  theme: "light" | "dark";
  sound: boolean;
  vibration: boolean;
  restSeconds: number;
  weightUnit: "kg" | "lb";
  notifications: boolean;
}

export interface PerformedSet {
  exerciseIndex: number;
  setIndex: number;
  exerciseName: string;
  reps: string;
  weight: string;
  method: TrainingMethod;
  seconds: number;
  completedAt: string;
}

export interface WorkoutHistory {
  id: string;
  workoutId: string;
  title: string;
  startedAt: string;
  finishedAt: string;
  durationSeconds: number;
  performed: PerformedSet[];
  volumeKg: number;
  weightUnit?: "kg" | "lb";
}

export interface TafAttempt {
  id: string;
  exerciseId: string;
  value: number;
  measuredAt: string;
  unit: TafUnit;
  exam?: string;
  notes?: string;
}

export interface TafExerciseOverride {
  name?: string;
  category?: string;
  purpose?: string;
  muscles?: string;
  metricLabel?: string;
  defaultUnit?: TafUnit;
  unitLabel?: string;
  higherIsBetter?: boolean;
  cue?: string;
}

export interface CustomTafExercise {
  id: string;
  name: string;
  category: string;
  purpose: string;
  muscles: string;
  metricLabel: string;
  defaultUnit: TafUnit;
  unitLabel: string;
  higherIsBetter: boolean;
  demo: "push-up";
  cue: string;
  custom: true;
}

export interface ActiveWorkout {
  workoutId: string;
  startedAt: string;
  /** Timestamp da retomada atual; ausente durante uma pausa. */
  resumedAt?: string;
  /** Segundos acumulados em segmentos ativos, sem contar períodos fora do app. */
  elapsedSeconds?: number;
  lastCheckpointAt?: string;
  isPaused?: boolean;
  exerciseIndex: number;
  setIndex: number;
  performed: PerformedSet[];
  restTimerEndsAt?: string | null;
  restPausedSeconds?: number | null;
  restRemainingSeconds?: number | null;
  restEndsAt?: string | null;
  restPaused?: boolean;
}

export interface BellaData {
  version: 1;
  profile: Profile;
  workouts: Workout[];
  customExercises: ExerciseDefinition[];
  exerciseOverrides: Record<string, Partial<ExerciseDefinition>>;
  tafExerciseOverrides: Record<string, TafExerciseOverride>;
  hiddenExerciseIds: string[];
  favorites: string[];
  schedule: Record<DayKey, string | null>;
  history: WorkoutHistory[];
  settings: Settings;
  activeWorkout: ActiveWorkout | null;
  tafAttempts: TafAttempt[];
  customTafExercises: CustomTafExercise[];
}

export interface BackupFile {
  format: "monster-fit-backup";
  version: 1;
  exportedAt: string;
  user: { name: string; email: string };
  data: BellaData;
}
