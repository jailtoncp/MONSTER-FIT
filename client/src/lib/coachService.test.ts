import { describe, expect, it } from "vitest";
import { createInitialData } from "./storageService";
import { getCoachReply } from "./coachService";

describe("Monster Coach", () => {
  it("uses the user's goal and saved routines in routine advice", () => {
    const data = createInitialData("Ana", "ana@example.com");
    const reply = getCoachReply("qual rotina combina comigo?", data);
    expect(reply).toContain("Hipertrofia");
    expect(reply).toContain("Treino");
  });

  it("explains a catalog exercise with its execution and defaults", () => {
    const data = createInitialData("Ana", "ana@example.com");
    const reply = getCoachReply("como executar agachamento?", data);
    expect(reply).toContain("Agachamento");
    expect(reply).toContain("séries");
    expect(reply).toContain("descanso");
  });

  it("stays inside the training scope when it does not understand a question", () => {
    const data = createInitialData("Ana", "ana@example.com");
    const reply = getCoachReply("qual a previsão do tempo?", data);
    expect(reply).toContain("execução de exercícios");
  });
});
