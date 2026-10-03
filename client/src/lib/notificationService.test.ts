import { describe, expect, it } from "vitest";
import { createInitialData } from "./storageService";
import { getDailyWorkoutReminder, localDateKey, reminderStorageKey } from "./notificationService";

describe("local training reminders", () => {
  it("uses the local weekday and offers the scheduled routine when it remains unfinished", () => {
    const data = createInitialData("QA", "qa@example.com");
    const friday = new Date(2026, 8, 25, 9, 0, 0);
    expect(getDailyWorkoutReminder(data, friday)?.title).toBe("Treino C");
    expect(localDateKey(friday)).toBe("2026-09-25");
    expect(reminderStorageKey("qa", friday)).toBe("monster-fit:reminder:v1:qa:2026-09-25");
  });

  it("does not remind when no workout is scheduled or today's session is already complete", () => {
    const data = createInitialData("QA", "qa@example.com");
    const friday = new Date(2026, 8, 25, 9, 0, 0);
    expect(getDailyWorkoutReminder({ ...data, schedule: { ...data.schedule, sex: null } }, friday)).toBeNull();
    expect(getDailyWorkoutReminder({ ...data, history: [{ id: "h", workoutId: data.workouts[2].id, title: "Treino C", startedAt: friday.toISOString(), finishedAt: new Date(2026, 8, 25, 8, 0, 0).toISOString(), durationSeconds: 3600, performed: [], volumeKg: 0 }] }, friday)).toBeNull();
  });
});
