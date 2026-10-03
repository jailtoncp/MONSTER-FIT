import { makeStarterWorkouts } from "./catalog";
import type { Account, BackupFile, BellaData, Goal } from "../types";

const ACCOUNTS_KEY = "monster-fit:accounts:v1";
const SESSION_KEY = "monster-fit:session:v1";
const DATA_PREFIX = "monster-fit:data:v1:";
const DEFAULT_GOAL: Goal = "Hipertrofia";

type StoredAccount = { id: string; email: string; name: string; salt: string; passwordHash: string };

function parseJson<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try { return JSON.parse(raw) as T; } catch { return fallback; }
}
function accounts(): StoredAccount[] {
  return parseJson<StoredAccount[]>(localStorage.getItem(ACCOUNTS_KEY), []);
}
function publicAccount(row: StoredAccount): Account {
  return { id: row.id, email: row.email, name: row.name };
}
function randomSalt(): string {
  const bytes = new Uint8Array(16);
  if (globalThis.crypto?.getRandomValues) globalThis.crypto.getRandomValues(bytes);
  else for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
  return Array.from(bytes).map((value) => value.toString(16).padStart(2, "0")).join("");
}
async function derivePassword(password: string, salt: string): Promise<string> {
  const input = new TextEncoder().encode(`${salt}:${password}`);
  if (globalThis.crypto?.subtle) {
    const key = await globalThis.crypto.subtle.importKey("raw", input, "PBKDF2", false, ["deriveBits"]);
    const bits = await globalThis.crypto.subtle.deriveBits({ name: "PBKDF2", salt: new TextEncoder().encode("Monster Fit local password v1"), iterations: 120_000, hash: "SHA-256" }, key, 256);
    return `pbkdf2$120000$${Array.from(new Uint8Array(bits)).map((value) => value.toString(16).padStart(2, "0")).join("")}`;
  }
  let hash = 2166136261;
  for (let i = 0; i < input.length; i++) { hash ^= input[i]; hash = Math.imul(hash, 16777619); }
  let value = (hash >>> 0).toString(16);
  for (let i = 0; i < 4096; i++) value = `${value}${((Math.imul(parseInt(value.slice(-8), 16) || 1, 16777619) >>> 0).toString(16))}`.slice(-32);
  return value;
}
function storageKey(accountId: string): string { return `${DATA_PREFIX}${accountId}`; }

export function createInitialData(name: string, email: string): BellaData {
  const workouts = makeStarterWorkouts();
  const schedule = Object.fromEntries((["seg", "ter", "qua", "qui", "sex", "sab", "dom"] as const).map((day) => [day, workouts.find((workout) => workout.days.includes(day))?.id ?? null])) as BellaData["schedule"];
  return {
    version: 1,
    profile: { name, email, age: "", heightCm: "", weightKg: "", goal: DEFAULT_GOAL },
    workouts, customExercises: [], customTafExercises: [], exerciseOverrides: {}, tafExerciseOverrides: {}, hiddenExerciseIds: [], favorites: [], schedule,
    history: [],
    settings: { theme: "dark", sound: false, vibration: true, restSeconds: 90, weightUnit: "kg", notifications: false },
    activeWorkout: null,
    tafAttempts: [],
  };
}

export async function registerAccount(name: string, email: string, password: string): Promise<Account> {
  const cleanEmail = email.trim().toLowerCase();
  if (!name.trim()) throw new Error("Digite seu nome para criar a conta.");
  if (!/^\S+@\S+\.\S+$/.test(cleanEmail)) throw new Error("Digite um e-mail válido.");
  if (password.length < 8) throw new Error("A senha deve ter pelo menos 8 caracteres.");
  const list = accounts();
  if (list.some((row) => row.email === cleanEmail)) throw new Error("Já existe uma conta local com este e-mail.");
  const id = globalThis.crypto?.randomUUID?.() ?? `user-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const salt = randomSalt();
  const row: StoredAccount = { id, email: cleanEmail, name: name.trim(), salt, passwordHash: await derivePassword(password, salt) };
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify([...list, row]));
  localStorage.setItem(storageKey(id), JSON.stringify(createInitialData(row.name, row.email)));
  localStorage.setItem(SESSION_KEY, id);
  return publicAccount(row);
}

export async function loginAccount(email: string, password: string): Promise<Account> {
  const cleanEmail = email.trim().toLowerCase();
  const row = accounts().find((item) => item.email === cleanEmail);
  if (!row || (await derivePassword(password, row.salt)) !== row.passwordHash) throw new Error("E-mail ou senha incorretos.");
  localStorage.setItem(SESSION_KEY, row.id);
  return publicAccount(row);
}

export async function resetLocalPassword(email: string, password: string): Promise<void> {
  const cleanEmail = email.trim().toLowerCase();
  if (password.length < 8) throw new Error("A nova senha deve ter pelo menos 8 caracteres.");
  const rows = accounts();
  const index = rows.findIndex((item) => item.email === cleanEmail);
  if (index < 0) throw new Error("Não encontramos uma conta local com esse e-mail neste dispositivo.");
  const salt = randomSalt();
  rows[index] = { ...rows[index], salt, passwordHash: await derivePassword(password, salt) };
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(rows));
}

export function getCurrentAccount(): Account | null {
  const id = localStorage.getItem(SESSION_KEY);
  if (!id) return null;
  const row = accounts().find((item) => item.id === id);
  return row ? publicAccount(row) : null;
}
export function signOut(): void { localStorage.removeItem(SESSION_KEY); }
export function deleteAccount(account: Account): void {
  const remaining = accounts().filter((row) => row.id !== account.id);
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(remaining));
  localStorage.removeItem(storageKey(account.id));
  localStorage.removeItem(SESSION_KEY);
}
export function loadData(account: Account): BellaData {
  const data = parseJson<BellaData | null>(localStorage.getItem(storageKey(account.id)), null);
  if (!data || data.version !== 1 || !data.profile || !Array.isArray(data.workouts)) return createInitialData(account.name, account.email);
  return {
    ...data,
    tafAttempts: Array.isArray(data.tafAttempts) ? data.tafAttempts : [],
    customTafExercises: Array.isArray(data.customTafExercises) ? data.customTafExercises : [],
    exerciseOverrides: data.exerciseOverrides && typeof data.exerciseOverrides === "object" ? data.exerciseOverrides : {},
    tafExerciseOverrides: data.tafExerciseOverrides && typeof data.tafExerciseOverrides === "object" ? data.tafExerciseOverrides : {},
    hiddenExerciseIds: Array.isArray(data.hiddenExerciseIds) ? data.hiddenExerciseIds : [],
  };
}
export function saveData(account: Account, data: BellaData): void {
  localStorage.setItem(storageKey(account.id), JSON.stringify(data));
}
export function makeBackup(account: Account, data: BellaData): BackupFile {
  return { format: "monster-fit-backup", version: 1, exportedAt: new Date().toISOString(), user: { name: data.profile.name || account.name, email: account.email }, data };
}
export function validateBackup(value: unknown): value is BackupFile {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<BackupFile>;
  const data = candidate.data;
  if (candidate.format !== "monster-fit-backup" || candidate.version !== 1 || !data || data.version !== 1) return false;
  if (!Array.isArray(data.workouts) || !Array.isArray(data.customExercises) || !Array.isArray(data.favorites) || !Array.isArray(data.history)) return false;
  if (!data.profile || typeof data.profile.name !== "string" || typeof data.profile.email !== "string") return false;
  if (!data.schedule || typeof data.schedule !== "object" || !data.settings || typeof data.settings !== "object") return false;
  if ("tafAttempts" in data && (!Array.isArray(data.tafAttempts) || data.tafAttempts.some((attempt) => !attempt || typeof attempt.id !== "string" || typeof attempt.exerciseId !== "string" || typeof attempt.value !== "number" || !Number.isFinite(attempt.value) || typeof attempt.measuredAt !== "string" || !["reps", "m", "cm", "s"].includes(attempt.unit)))) return false;
  if ("customTafExercises" in data && (!Array.isArray(data.customTafExercises) || data.customTafExercises.some((exercise) => !exercise || typeof exercise.id !== "string" || typeof exercise.name !== "string" || !exercise.name.trim() || typeof exercise.purpose !== "string" || !exercise.purpose.trim() || typeof exercise.category !== "string" || typeof exercise.muscles !== "string" || typeof exercise.metricLabel !== "string" || !["reps", "m", "cm", "s"].includes(exercise.defaultUnit) || typeof exercise.unitLabel !== "string" || typeof exercise.higherIsBetter !== "boolean" || exercise.demo !== "push-up" || exercise.custom !== true || typeof exercise.cue !== "string"))) return false;
  if (data.workouts.some((workout) => !workout || typeof workout.id !== "string" || typeof workout.title !== "string" || !Array.isArray(workout.exercises) || workout.exercises.some((exercise) => !exercise || typeof exercise.name !== "string" || !Array.isArray(exercise.sets) || exercise.sets.length > 10 || exercise.sets.some((set) => !set || typeof set.reps !== "string" || typeof set.weight !== "string")))) return false;
  if (data.history.some((session) => !session || typeof session.id !== "string" || !Array.isArray(session.performed) || typeof session.finishedAt !== "string")) return false;
  return true;
}
