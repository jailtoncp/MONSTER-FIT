import { beforeEach, describe, expect, it, vi } from "vitest";
import { deleteAccount, getCurrentAccount, loadData, loginAccount, makeBackup, registerAccount, resetLocalPassword, saveData, signOut, validateBackup } from "./storageService";
import type { ExerciseDefinition } from "../types";

class MemoryStorage implements Storage {
  private items = new Map<string, string>();
  get length() { return this.items.size; }
  clear() { this.items.clear(); }
  getItem(key: string) { return this.items.get(key) ?? null; }
  key(index: number) { return [...this.items.keys()][index] ?? null; }
  removeItem(key: string) { this.items.delete(key); }
  setItem(key: string, value: string) { this.items.set(key, String(value)); }
}

beforeEach(() => {
  vi.stubGlobal("localStorage", new MemoryStorage());
});

describe("Monster Fit local account storage", () => {
  it("registers a normalized account with starter routines and scheduled days", async () => {
    const account = await registerAccount(" Ana Silva ", " ANA@EXAMPLE.COM ", "strong-pass-1");
    const data = loadData(account);
    expect(account.email).toBe("ana@example.com");
    expect(account.name).toBe("Ana Silva");
    expect(getCurrentAccount()?.id).toBe(account.id);
    expect(data.workouts).toHaveLength(3);
    expect(data.schedule.seg).toBe(data.workouts[0].id);
    expect(data.schedule.qua).toBe(data.workouts[1].id);
    expect(data.schedule.sex).toBe(data.workouts[2].id);
    expect(data.settings.theme).toBe("dark");
    await expect(registerAccount("Ana", "ana@example.com", "strong-pass-1")).rejects.toThrow("Já existe");
  });

  it("authenticates, logs out, and rejects an incorrect password", async () => {
    const account = await registerAccount("Bia", "bia@example.com", "strong-pass-2");
    signOut();
    expect(getCurrentAccount()).toBeNull();
    await expect(loginAccount("bia@example.com", "not-the-password")).rejects.toThrow("incorretos");
    expect((await loginAccount(" BIA@EXAMPLE.COM ", "strong-pass-2")).id).toBe(account.id);
  });

  it("keeps user data isolated and deletes only the requested local account", async () => {
    const first = await registerAccount("Carla", "carla@example.com", "strong-pass-3");
    const firstData = loadData(first);
    firstData.profile.weightKg = "70";
    saveData(first, firstData);
    const second = await registerAccount("Duda", "duda@example.com", "strong-pass-4");
    expect(loadData(second).profile.weightKg).toBe("");
    await loginAccount(first.email, "strong-pass-3");
    expect(loadData(first).profile.weightKg).toBe("70");
    deleteAccount(first);
    expect(getCurrentAccount()).toBeNull();
    await expect(loginAccount(first.email, "strong-pass-3")).rejects.toThrow("incorretos");
    expect((await loginAccount(second.email, "strong-pass-4")).id).toBe(second.id);
  });

  it("allows local password reset and validates complete backups", async () => {
    const account = await registerAccount("Eva", "eva@example.com", "strong-pass-5");
    const backup = makeBackup(account, loadData(account));
    expect(validateBackup(backup)).toBe(true);
    expect(validateBackup({ format: "monster-fit-backup", version: 1, data: { ...backup.data, workouts: [{ id: "bad", title: "Bad", exercises: [{ name: "x", sets: [{ reps: "4", weight: 1 }] }] }] } })).toBe(false);
    await resetLocalPassword(account.email, "updated-pass-6");
    signOut();
    await expect(loginAccount(account.email, "strong-pass-5")).rejects.toThrow("incorretos");
    expect((await loginAccount(account.email, "updated-pass-6")).id).toBe(account.id);
  });

  it("migrates existing local data and backups that predate TAF tracking", async () => {
    const account = await registerAccount("Legacy", "legacy@example.com", "strong-pass-8");
    const key = `monster-fit:data:v1:${account.id}`;
    const legacyData = JSON.parse(localStorage.getItem(key)!) as Record<string, unknown>;
    delete legacyData.tafAttempts;
    localStorage.setItem(key, JSON.stringify(legacyData));

    expect(loadData(account).tafAttempts).toEqual([]);
    const backup = makeBackup(account, loadData(account));
    delete (backup.data as Partial<typeof backup.data>).tafAttempts;
    expect(validateBackup(backup)).toBe(true);

    const malformed = { ...backup, data: { ...backup.data, tafAttempts: [{ id: "broken" }] } };
    expect(validateBackup(malformed)).toBe(false);
  });

  it("preserves the technical purpose and primary/secondary muscles of personal exercises", async () => {
    const account = await registerAccount("Fabi", "fabi@example.com", "strong-pass-7");
    const data = loadData(account);
    const customExercise: ExerciseDefinition = {
      id: "custom-extension",
      name: "Extensão personalizada",
      muscle: "Pernas",
      equipment: "Máquina",
      description: "Observação de execução.",
      instructions: "Executar conforme orientação profissional.",
      defaultSets: 3,
      defaultReps: "12",
      defaultRestSeconds: 60,
      purpose: "Estender o joelho contra resistência.",
      primaryMuscles: ["Quadríceps"],
      secondaryMuscles: ["Reto femoral", "Vasto medial"],
      custom: true,
    };
    data.customExercises.push(customExercise);
    saveData(account, data);

    const restored = loadData(account).customExercises.find((exercise) => exercise.id === customExercise.id);
    expect(restored?.purpose).toBe(customExercise.purpose);
    expect(restored?.primaryMuscles).toEqual(["Quadríceps"]);
    expect(restored?.secondaryMuscles).toEqual(["Reto femoral", "Vasto medial"]);

    const backup = makeBackup(account, loadData(account));
    expect(validateBackup(backup)).toBe(true);
    const imported = JSON.parse(JSON.stringify(backup));
    expect(validateBackup(imported)).toBe(true);
    expect(imported.data.customExercises[0].primaryMuscles).toEqual(["Quadríceps"]);
    expect(imported.data.customExercises[0].secondaryMuscles).toEqual(["Reto femoral", "Vasto medial"]);
  });
});
