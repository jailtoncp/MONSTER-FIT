import type { CustomTafExercise, TafAttempt, TafUnit } from "../types";

export type TafDemoKind = "rower" | "distance-run" | "sprint" | "static-bar" | "pull-up" | "jump" | "rope" | "shuttle" | "push-up";

export interface TafExercise {
  id: string;
  name: string;
  category: string;
  purpose: string;
  muscles: string;
  metricLabel: string;
  defaultUnit: TafUnit;
  unitLabel: string;
  higherIsBetter: boolean;
  demo: TafDemoKind;
  cue: string;
}

/** Modalidades comuns em TAFs policiais; cada edital define suas próprias regras. */
export const TAF_EXERCISES: TafExercise[] = [
  { id: "abdominal-remador", name: "Abdominal remador", category: "Abdômen", purpose: "Flexão do tronco combinada à flexão do quadril, saindo da posição deitada até a posição sentada, conforme o protocolo do edital.", muscles: "Reto abdominal, oblíquos e flexores do quadril", metricLabel: "Repetições", defaultUnit: "reps", unitLabel: "reps", higherIsBetter: true, demo: "rower", cue: "Registre as repetições e anote o protocolo do seu edital." },
  { id: "corrida-12-min", name: "Corrida de 12 minutos", category: "Resistência aeróbica", purpose: "Avalia a distância percorrida durante o tempo estipulado pela prova; a marca é registrada em metros.", muscles: "Membros inferiores e sistema cardiorrespiratório", metricLabel: "Distância percorrida", defaultUnit: "m", unitLabel: "m", higherIsBetter: true, demo: "distance-run", cue: "Anote a distância total, local e as condições da tentativa." },
  { id: "tiro-50-m", name: "Tiro de 50 metros", category: "Velocidade", purpose: "Registra o tempo gasto no percurso curto, conforme distância e regras definidos pela seleção.", muscles: "Glúteos, quadríceps, isquiotibiais e panturrilhas", metricLabel: "Tempo", defaultUnit: "s", unitLabel: "s", higherIsBetter: false, demo: "sprint", cue: "Use segundos e registre as condições da medição." },
  { id: "barra-isometrica", name: "Isometria na barra fixa", category: "Força e resistência", purpose: "Sustentação isométrica na barra; posição de pegada e critérios de início/fim variam por edital.", muscles: "Flexores do cotovelo, dorsais, deltoides e estabilizadores escapulares", metricLabel: "Tempo sustentado", defaultUnit: "s", unitLabel: "s", higherIsBetter: true, demo: "static-bar", cue: "Registre o tempo sustentado e a referência do concurso." },
  { id: "barra-fixa", name: "Flexão na barra fixa", category: "Força e resistência", purpose: "Puxada vertical com o peso corporal; a execução válida e a amplitude são definidas pelo edital.", muscles: "Grande dorsal, bíceps braquial, braquial e musculatura escapular", metricLabel: "Repetições válidas", defaultUnit: "reps", unitLabel: "reps", higherIsBetter: true, demo: "pull-up", cue: "Conte somente as repetições que atendem ao padrão da sua prova." },
  { id: "salto-horizontal", name: "Salto horizontal", category: "Potência", purpose: "Salto partindo de posição estacionária; registra-se a distância alcançada segundo a medição prevista na prova.", muscles: "Glúteos, quadríceps, isquiotibiais e panturrilhas", metricLabel: "Distância", defaultUnit: "cm", unitLabel: "cm", higherIsBetter: true, demo: "jump", cue: "Registre em centímetros usando sempre o mesmo critério de medição." },
  { id: "subida-corda", name: "Subida em corda", category: "Força e coordenação", purpose: "Subida vertical com coordenação entre membros superiores e inferiores; altura, técnica e eventual limite de tempo dependem do edital.", muscles: "Dorsais, flexores dos cotovelos, antebraços, core e membros inferiores", metricLabel: "Altura alcançada", defaultUnit: "m", unitLabel: "m", higherIsBetter: true, demo: "rope", cue: "Registre a altura alcançada; descreva a regra do edital nas observações." },
  { id: "shuttle-run", name: "Shuttle run", category: "Agilidade", purpose: "Deslocamento com mudanças de direção entre marcas; distância, número de percursos e cronometragem devem seguir o edital.", muscles: "Membros inferiores, core e musculatura estabilizadora", metricLabel: "Tempo", defaultUnit: "s", unitLabel: "s", higherIsBetter: false, demo: "shuttle", cue: "Anote o percurso usado para que resultados diferentes não sejam confundidos." },
  { id: "flexao-solo", name: "Flexão de braços no solo", category: "Força e resistência", purpose: "Empurrada horizontal com o peso corporal; posição e amplitude consideradas válidas variam entre provas.", muscles: "Peitoral maior, tríceps braquial, deltoide anterior e estabilizadores do tronco", metricLabel: "Repetições válidas", defaultUnit: "reps", unitLabel: "reps", higherIsBetter: true, demo: "push-up", cue: "Registre apenas repetições válidas segundo o regulamento do seu concurso." },
];

export function createCustomTafExercise(id: string, name: string, description: string, unit: TafUnit, higherIsBetter: boolean): CustomTafExercise {
  const metricLabels: Record<TafUnit, string> = { reps: "Repetições", m: "Distância", cm: "Distância", s: "Tempo" };
  const unitLabels: Record<TafUnit, string> = { reps: "reps", m: "m", cm: "cm", s: "s" };
  return { id, name: name.trim(), category: "Personalizado", purpose: description.trim(), muscles: "Modalidade personalizada", metricLabel: metricLabels[unit], defaultUnit: unit, unitLabel: unitLabels[unit], higherIsBetter, demo: "push-up", cue: `Use sempre a mesma unidade (${unitLabels[unit]}) e registre conforme a descrição informada.`, custom: true };
}

export function appendTafAttempt(attempts: TafAttempt[], attempt: TafAttempt): TafAttempt[] {
  return [...attempts, attempt].sort((a, b) => b.measuredAt.localeCompare(a.measuredAt));
}

export function formatTafValue(value: number, unit: TafUnit): string {
  const formatted = value.toLocaleString("pt-BR", { maximumFractionDigits: unit === "s" ? 2 : unit === "reps" ? 0 : 1 });
  if (unit === "reps") return `${formatted} ${value === 1 ? "repetição" : "repetições"}`;
  if (unit === "s") return `${formatted} s`;
  return `${formatted} ${unit}`;
}

export function getTafBest(attempts: TafAttempt[], exercise: TafExercise): number | null {
  const values = attempts.filter((attempt) => attempt.exerciseId === exercise.id && attempt.unit === exercise.defaultUnit).map((attempt) => attempt.value);
  if (!values.length) return null;
  return exercise.higherIsBetter ? Math.max(...values) : Math.min(...values);
}

export interface TafProgressPoint {
  id: string;
  timestamp: number;
  dateLabel: string;
  fullDateLabel: string;
  value: number;
  exam?: string;
}

function parseMeasuredDate(value: string): Date {
  // Imported backups may store a date without a time; place it at local noon
  // to avoid a previous-day shift in time zones west of UTC.
  return new Date(/^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T12:00:00` : value);
}

/** Converts saved attempts into oldest-first chart points for one consistent metric. */
export function getTafProgressPoints(attempts: TafAttempt[], exercise: TafExercise): TafProgressPoint[] {
  return attempts
    .filter((attempt) => attempt.exerciseId === exercise.id && attempt.unit === exercise.defaultUnit && Number.isFinite(attempt.value) && attempt.value > 0)
    .map((attempt) => {
      const date = parseMeasuredDate(attempt.measuredAt);
      return {
        id: attempt.id,
        timestamp: date.getTime(),
        dateLabel: Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit" }),
        fullDateLabel: Number.isNaN(date.getTime()) ? "Data não disponível" : date.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" }),
        value: attempt.value,
        exam: attempt.exam,
      };
    })
    .filter((point) => Number.isFinite(point.timestamp))
    .sort((a, b) => a.timestamp - b.timestamp || a.id.localeCompare(b.id));
}
