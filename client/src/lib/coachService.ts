import type { BellaData, ExerciseDefinition, Workout } from "../types";
import { EXERCISE_CATALOG } from "./catalog";
import { TAF_EXERCISES } from "./tafService";

export type CoachContext = Pick<BellaData, "profile" | "workouts" | "customExercises" | "history" | "settings">;

export const COACH_SUGGESTIONS = [
  "Qual rotina combina comigo?",
  "Como executar agachamento?",
  "Quanto descanso entre séries?",
  "Como evoluir sem exagerar?",
];

function normalize(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR");
}
function firstName(data: CoachContext) { return data.profile.name.trim().split(/\s+/)[0] || "atleta"; }
function exerciseMatch(question: string, exercises: ExerciseDefinition[]) {
  const text = normalize(question);
  return exercises.find((exercise) => text.includes(normalize(exercise.name))) ?? exercises.find((exercise) => normalize(exercise.name).split(" ").some((word) => word.length > 4 && text.includes(word)));
}
function routineAdvice(data: CoachContext) {
  const goal = data.profile.goal;
  const routines = data.workouts.filter((workout) => workout.exercises.length);
  const frequency = new Set(data.history.map((item) => item.finishedAt.slice(0, 10))).size;
  const goalText: Record<string, string> = {
    Hipertrofia: "priorize consistência, cargas progressivas e séries próximas da falha com técnica segura",
    Emagrecimento: "combine musculação com caminhadas ou cardio leve e mantenha uma rotina que você consiga repetir",
    Força: "use movimentos básicos, descanso um pouco maior e progressão gradual de carga",
    Condicionamento: "misture treinos de força com blocos de resistência e mantenha intervalos controlados",
    Manutenção: "busque uma rotina equilibrada, variada e sustentável ao longo da semana",
  };
  const best = routines.sort((a, b) => b.exercises.length - a.exercises.length)[0];
  return `Para ${firstName(data)}, pensando em **${goal}**, eu começaria por uma rotina que ${goalText[goal] ?? goalText.Manutenção}. ${best ? `Seu treino mais completo hoje é **${best.title}**, com ${best.exercises.length} exercícios.` : "Você ainda não tem uma rotina cadastrada; criar 2 ou 3 treinos curtos já é um ótimo começo."} ${frequency ? `Você já registrou ${frequency} dia${frequency === 1 ? "" : "s"} de treino no histórico.` : "Ainda não há sessões concluídas no histórico, então comece com uma meta pequena e realista."}`;
}
function exerciseAdvice(exercise: ExerciseDefinition) {
  return `Sobre **${exercise.name}**: ${exercise.description} Para executar, ${exercise.instructions.toLocaleLowerCase()} A referência atual é **${exercise.defaultSets} séries de ${exercise.defaultReps}**, com cerca de **${exercise.defaultRestSeconds}s de descanso**. Comece com uma carga que permita controlar toda a amplitude; se sentir dor aguda, pare e procure orientação profissional.`;
}

export function getCoachReply(question: string, data: CoachContext): string {
  const text = normalize(question.trim());
  const allExercises = [...EXERCISE_CATALOG, ...data.customExercises];
  if (!text) return `Estou aqui, ${firstName(data)}. Pergunte sobre execução, descanso, progressão ou sua rotina.`;
  if (/^(oi|ola|bom dia|boa tarde|boa noite|hey|hello)/.test(text)) return `Oi, ${firstName(data)}! Eu sou a Monster Coach. Posso te ajudar com exercícios, rotina, descanso e evolução — sempre de um jeito simples e seguro.`;
  if (text.includes("rotina") || text.includes("melhor treino") || text.includes("treino para mim") || text.includes("qual treino") || text.includes("montar treino")) return routineAdvice(data);
  if (text.includes("taf") || text.includes("teste de aptidao")) return `No TAF, o edital é sempre a referência principal. Treine a técnica do movimento, registre suas marcas e evite transformar uma prova específica em regra universal. Posso explicar modalidades como barra, corrida, flexão, salto e abdominal.`;
  if (text.includes("descanso") || text.includes("intervalo")) return `Como ponto de partida, use 45–75s em exercícios de isolamento e 90–150s em movimentos mais exigentes. Se a técnica estiver piorando ou você não conseguir repetir as séries, descanse um pouco mais. O melhor intervalo é aquele que mantém qualidade e segurança.`;
  if (text.includes("progred") || text.includes("aumentar carga") || text.includes("evolu")) return `Uma progressão simples: mantenha a técnica, tente completar o topo da faixa de repetições e só então aumente um pouco a carga. Registre reps e peso no Monster Fit; evolução sustentável é melhor do que subir rápido e perder o controle.`;
  if (text.includes("dor") || text.includes("lesao") || text.includes("machuquei")) return `Dor aguda, perda de força, formigamento ou dor que piora não devem ser ignorados. Pare o movimento e procure um profissional de saúde. Eu posso explicar a execução, mas não substituo avaliação médica ou de um treinador.`;
  const exercise = exerciseMatch(question, allExercises);
  if (exercise) return exerciseAdvice(exercise);
  if (text.includes("historico") || text.includes("treinei") || text.includes("frequencia")) return `Você tem ${data.history.length} sessão${data.history.length === 1 ? "" : "ões"} registrada${data.history.length === 1 ? "" : "s"}. O mais importante é observar consistência, cargas e qualidade das execuções — não apenas o número na balança.`;
  if (text.includes("serie") || text.includes("repeticao") || text.includes("rep")) return `Para começar, 2–4 séries de 8–15 repetições funciona bem para muitos exercícios de musculação. A faixa pode mudar conforme objetivo e movimento. Priorize amplitude controlada e ajuste ao seu nível.`;
  const taf = TAF_EXERCISES.find((item) => text.includes(normalize(item.name)));
  if (taf) return `**${taf.name}** mede ${taf.metricLabel.toLocaleLowerCase()} (${taf.unitLabel}). ${taf.purpose} ${taf.cue}`;
  return `Posso ajudar com quatro temas: **execução de exercícios**, **rotina para seu objetivo**, **descanso e séries** ou **progressão**. Tente perguntar, por exemplo: “como executar o ${allExercises[0]?.name ?? "agachamento"}?”`;
}

export function coachGreeting(data: CoachContext) {
  return `Oi, ${firstName(data)}! Eu sou o **Monster Coach**, seu parceiro de treino. Me pergunte qualquer coisa sobre execução, rotina, descanso ou evolução.`;
}

export function workoutSummary(workout: Workout) {
  return `${workout.title}: ${workout.exercises.length} exercícios e ${workout.exercises.reduce((total, exercise) => total + exercise.sets.length, 0)} séries.`;
}
