import type { DayKey, ExerciseDefinition, ExerciseSet, Workout, WorkoutExercise } from "../types";
import { EXERCISE_IMAGES } from "./exerciseImages";
import { EXERCISE_FOCUS } from "./exerciseFocus";

const rows: Array<[string, string, string, string, number, string, number, string, string]> = [
  ["hip-thrust", "Hip Thrust", "Glúteos", "Barra", 4, "12", 90, "Extensão de quadril com ênfase em glúteos.", "Apoie a parte superior das costas no banco, mantenha o queixo recolhido e suba até alinhar quadril e tronco."],
  ["elevacao-pelvica", "Elevação pélvica", "Glúteos", "Barra", 4, "12", 90, "Movimento de extensão de quadril feito no solo.", "Mantenha os pés firmes, contraia o abdômen e pause no topo sem hiperestender a lombar."],
  ["glute-bridge", "Glute Bridge", "Glúteos", "Peso corporal", 3, "15", 60, "Ponte de glúteos para ativação e controle.", "Deite-se, aproxime os calcanhares do quadril e eleve a pelve com controle."],
  ["coice", "Coice", "Glúteos", "Cabo", 3, "12", 60, "Extensão unilateral de quadril no cabo.", "Estabilize o tronco e mova a perna sem embalar o corpo."],
  ["abducao", "Abdução", "Glúteos", "Máquina", 3, "15", 60, "Abdução de quadril com resistência controlada.", "Mantenha o tronco estável e retorne devagar, sem deixar a carga bater."],
  ["agachamento-sumo", "Agachamento sumô", "Glúteos", "Halter", 3, "12", 90, "Agachamento com base ampla e pés apontados para fora.", "Desça entre os quadris mantendo joelhos alinhados com os pés."],
  ["agachamento", "Agachamento", "Pernas", "Barra", 4, "10", 120, "Agachamento multiarticular para membros inferiores.", "Tronco firme, pés estáveis e joelhos acompanhando a direção dos dedos."],
  ["leg-press", "Leg Press", "Pernas", "Máquina", 4, "12", 90, "Empurrada de pernas em máquina guiada.", "Desça até onde a pelve permaneça apoiada e empurre sem travar os joelhos."],
  ["hack", "Hack", "Pernas", "Máquina", 3, "10", 90, "Agachamento guiado no aparelho hack.", "Mantenha as costas apoiadas, controle a descida e evite travar os joelhos."],
  ["extensora", "Cadeira extensora", "Pernas", "Máquina", 3, "12", 60, "Extensão de joelho para quadríceps.", "Ajuste o eixo da máquina ao joelho e suba sem impulso."],
  ["flexora", "Cadeira flexora", "Pernas", "Máquina", 3, "12", 60, "Flexão de joelho para posteriores de coxa.", "Mantenha o quadril apoiado e controle a volta da carga."],
  ["stiff", "Stiff", "Posterior", "Barra", 4, "10", 90, "Hinge de quadril com foco em posteriores.", "Leve o quadril para trás, mantenha a coluna neutra e a barra próxima às pernas."],
  ["afundo", "Afundo", "Pernas", "Halteres", 3, "10", 90, "Movimento unilateral de membros inferiores.", "Dê um passo confortável e desça mantendo o tronco firme."],
  ["passada", "Passada", "Pernas", "Halteres", 3, "12", 90, "Passos alternados para força e estabilidade.", "Mantenha espaço entre os pés e controle cada troca de apoio."],
  ["panturrilha", "Panturrilha", "Pernas", "Máquina", 4, "15", 60, "Elevação dos calcanhares para panturrilhas.", "Use amplitude completa, pause no topo e desça com controle."],
  ["puxada-frontal", "Puxada frontal", "Costas", "Cabo", 4, "10", 75, "Puxada vertical para dorsais.", "Puxe em direção à parte alta do peito sem balançar o tronco."],
  ["remada-baixa", "Remada baixa", "Costas", "Cabo", 3, "12", 75, "Remada horizontal para costas.", "Inicie o movimento com as escápulas e mantenha o peito aberto."],
  ["remada-unilateral", "Remada unilateral", "Costas", "Halter", 3, "10", 75, "Remada unilateral apoiada.", "Mantenha o tronco estável e conduza o cotovelo para trás."],
  ["remada-curvada", "Remada curvada", "Costas", "Barra", 4, "8", 90, "Remada inclinada para costas.", "Incline o tronco com coluna neutra e puxe a barra em direção ao abdômen."],
  ["supino", "Supino", "Peito", "Barra", 4, "8", 90, "Press horizontal para peitoral.", "Mantenha os pés firmes e desça a barra com controle."],
  ["crucifixo", "Crucifixo", "Peito", "Halteres", 3, "12", 60, "Adução horizontal com ênfase no peitoral.", "Flexione levemente os cotovelos e use amplitude confortável."],
  ["crossover", "Crossover", "Peito", "Cabo", 3, "12", 60, "Adução de braços em cabos.", "Mantenha o tronco estável e aproxime as mãos sem perder o controle."],
  ["elevacao-lateral", "Elevação lateral", "Ombros", "Halteres", 3, "12", 60, "Elevação lateral para deltoides.", "Eleve os braços até a linha dos ombros sem usar impulso."],
  ["elevacao-frontal", "Elevação frontal", "Ombros", "Halteres", 3, "12", 60, "Elevação anterior dos braços.", "Suba até a altura dos ombros com punhos neutros."],
  ["desenvolvimento", "Desenvolvimento", "Ombros", "Halteres", 4, "10", 75, "Press vertical para ombros.", "Mantenha o abdômen ativo e empurre sem arquear a lombar."],
  ["rosca-direta", "Rosca direta", "Bíceps", "Barra", 3, "12", 60, "Flexão de cotovelos com barra.", "Mantenha os cotovelos próximos ao tronco e evite balançar."],
  ["rosca-alternada", "Rosca alternada", "Bíceps", "Halteres", 3, "10", 60, "Rosca unilateral alternada.", "Gire a palma na subida se for confortável e controle a descida."],
  ["rosca-martelo", "Rosca martelo", "Bíceps", "Halteres", 3, "12", 60, "Rosca com pegada neutra.", "Mantenha os punhos alinhados e os cotovelos estáveis."],
  ["triceps-pulley", "Tríceps pulley", "Tríceps", "Cabo", 3, "12", 60, "Extensão de cotovelos na polia.", "Fixe os cotovelos junto ao corpo e estenda sem projetar os ombros."],
  ["triceps-frances", "Tríceps francês", "Tríceps", "Halter", 3, "12", 60, "Extensão acima da cabeça para tríceps.", "Mantenha os cotovelos apontados para frente e mova os antebraços."],
  ["triceps-testa", "Tríceps testa", "Tríceps", "Barra", 3, "10", 60, "Extensão de cotovelos deitada.", "Desça a barra com controle, mantendo os braços estáveis."],
  ["abdominal", "Abdominal", "Abdômen", "Peso corporal", 3, "15", 45, "Flexão controlada do tronco.", "Expire ao subir e mantenha a lombar confortável."],
  ["prancha", "Prancha", "Abdômen", "Peso corporal", 3, "45", 45, "Isometria de estabilização do tronco.", "Alinhe cabeça, tronco e quadril e respire sem prender o ar."],
  ["elevacao-pernas", "Elevação de pernas", "Abdômen", "Peso corporal", 3, "12", 45, "Elevação controlada das pernas.", "Mantenha o abdômen ativo e evite arquear a lombar."],
  ["kickback-elastico", "Coice com elástico", "Glúteos", "Elástico", 3, "15", 60, "Extensão de quadril com resistência elástica.", "Prenda o elástico com segurança, mantenha o quadril alinhado e leve a perna para trás sem girar a pelve."],
  ["abducao-elastico", "Abdução com elástico", "Glúteos", "Elástico", 3, "20", 45, "Abdução de quadril com faixa elástica.", "Mantenha tensão constante no elástico e afaste os joelhos sem inclinar o tronco."],
  ["glute-bridge-elastico", "Ponte de glúteo com elástico", "Glúteos", "Elástico", 3, "15", 60, "Ponte de quadril com resistência nos joelhos.", "Empurre os joelhos levemente para fora e faça uma pausa no topo do movimento."],
  ["agachamento-bulgaro", "Agachamento búlgaro", "Pernas", "Halteres", 3, "10", 90, "Agachamento unilateral com o pé traseiro apoiado.", "Use uma base estável, desça verticalmente e mantenha o joelho da frente alinhado ao pé."],
  ["agachamento-frontal", "Agachamento frontal", "Pernas", "Barra", 4, "8", 120, "Agachamento com a barra posicionada à frente dos ombros.", "Mantenha os cotovelos altos, o tronco firme e desça apenas até preservar a postura."],
  ["agachamento-goblet", "Agachamento goblet", "Pernas", "Halter", 3, "12", 90, "Agachamento segurando um peso junto ao peito.", "Segure o halter próximo ao corpo e empurre o chão mantendo os joelhos acompanhando os pés."],
  ["step-up", "Step-up", "Pernas", "Peso corporal", 3, "10", 75, "Subida em plataforma para força unilateral.", "Apoie todo o pé na plataforma e suba usando principalmente a perna que está em cima."],
  ["mesa-flexora", "Mesa flexora", "Posterior", "Máquina", 3, "12", 60, "Flexão de joelhos deitado na máquina.", "Ajuste o rolo acima dos calcanhares, mantenha o quadril apoiado e controle a descida."],
  ["good-morning", "Good morning", "Posterior", "Barra", 3, "10", 90, "Dobradiça de quadril com barra apoiada nas costas.", "Flexione levemente os joelhos, leve o quadril para trás e mantenha a coluna neutra."],
  ["levantamento-terra", "Levantamento terra", "Posterior", "Barra", 4, "6", 150, "Levantamento do solo com extensão de quadril e joelhos.", "Mantenha a barra próxima às pernas, firme o abdômen e não arredonde a lombar."],
  ["terra-sumo", "Levantamento terra sumô", "Pernas", "Barra", 4, "6", 150, "Levantamento com base ampla e maior participação dos adutores.", "Abra os pés confortavelmente, empurre o chão e mantenha a barra próxima ao corpo."],
  ["panturrilha-sentado", "Panturrilha sentado", "Pernas", "Máquina", 4, "15", 60, "Flexão plantar sentado com ênfase no sóleo.", "Desça o calcanhar com controle e faça uma pausa no ponto alto."],
  ["panturrilha-unilateral", "Panturrilha unilateral", "Pernas", "Peso corporal", 3, "15", 45, "Elevação de calcanhar em um apoio.", "Use uma parede para equilíbrio e complete a amplitude sem saltar."],
  ["pullover-cabo", "Pullover na polia", "Costas", "Cabo", 3, "12", 60, "Extensão de ombro na polia para dorsais.", "Mantenha os braços levemente flexionados e puxe a barra até as coxas sem balançar."],
  ["puxada-neutra", "Puxada neutra", "Costas", "Cabo", 4, "10", 75, "Puxada vertical com pegada neutra.", "Conduza os cotovelos para baixo e evite compensar com a lombar."],
  ["barra-fixa", "Barra fixa", "Costas", "Peso corporal", 4, "6", 120, "Puxada vertical com o peso do corpo.", "Inicie com as escápulas, mantenha o corpo firme e suba sem impulso."],
  ["remada-maquina", "Remada articulada", "Costas", "Máquina", 3, "10", 75, "Remada sentada em máquina guiada.", "Apoie o peito quando houver suporte e aproxime as escápulas com controle."],
  ["face-pull", "Face pull", "Costas", "Cabo", 3, "15", 60, "Puxada para a face com foco na parte superior das costas.", "Puxe a corda na direção do rosto, abrindo os cotovelos e mantendo os ombros baixos."],
  ["encolhimento", "Encolhimento de ombros", "Costas", "Halteres", 3, "12", 60, "Elevação dos ombros para trapézio.", "Eleve os ombros verticalmente sem fazer círculos e retorne devagar."],
  ["supino-inclinado", "Supino inclinado", "Peito", "Halteres", 4, "10", 90, "Press inclinado com maior participação da porção clavicular do peitoral.", "Mantenha as escápulas apoiadas, desça os halteres com controle e não bata os pesos."],
  ["supino-maquina", "Supino na máquina", "Peito", "Máquina", 3, "12", 75, "Press horizontal guiado para peitoral.", "Ajuste o banco para as mãos ficarem na linha média do peito e empurre sem travar os cotovelos."],
  ["flexao", "Flexão de braços", "Peito", "Peso corporal", 3, "10", 60, "Press horizontal com o peso do corpo.", "Mantenha o corpo alinhado e desça aproximando o peito do chão sem perder a posição."],
  ["flexao-inclinada", "Flexão inclinada", "Peito", "Peso corporal", 3, "12", 45, "Variação de flexão com as mãos elevadas.", "Use uma superfície firme e mantenha o tronco alinhado durante todo o movimento."],
  ["crucifixo-maquina", "Peck deck", "Peito", "Máquina", 3, "12", 60, "Adução horizontal dos braços na máquina.", "Mantenha o peito aberto e aproxime os braços sem deixar a carga bater."],
  ["desenvolvimento-maquina", "Desenvolvimento na máquina", "Ombros", "Máquina", 3, "10", 75, "Press vertical guiado para os ombros.", "Ajuste o banco, mantenha as costas apoiadas e empurre sem elevar os ombros."],
  ["elevacao-lateral-cabo", "Elevação lateral no cabo", "Ombros", "Cabo", 3, "12", 60, "Abdução do ombro com resistência contínua.", "Comece com o cabo cruzado à frente do corpo e eleve até uma altura confortável."],
  ["posterior-maquina", "Voador inverso", "Ombros", "Máquina", 3, "15", 60, "Abertura posterior para deltoide posterior.", "Mantenha os ombros baixos e abra os braços sem usar impulso."],
  ["rosca-scott", "Rosca Scott", "Bíceps", "Máquina", 3, "12", 60, "Flexão de cotovelo com os braços apoiados.", "Mantenha os braços apoiados e não estenda completamente os cotovelos sob carga."],
  ["rosca-cabo", "Rosca na polia", "Bíceps", "Cabo", 3, "12", 60, "Rosca com tensão contínua da polia.", "Mantenha o tronco parado e mova apenas os antebraços."],
  ["rosca-elastico", "Rosca com elástico", "Bíceps", "Elástico", 3, "15", 45, "Flexão de cotovelos com faixa elástica.", "Pise no centro do elástico, mantenha os cotovelos junto ao corpo e controle a volta."],
  ["triceps-corda", "Tríceps corda", "Tríceps", "Cabo", 3, "12", 60, "Extensão de cotovelos usando corda.", "Separe as pontas no final e mantenha os cotovelos estáveis ao lado do corpo."],
  ["triceps-coice", "Tríceps coice", "Tríceps", "Halteres", 3, "12", 60, "Extensão de cotovelo com o tronco inclinado.", "Fixe o braço acima do cotovelo e estenda o antebraço sem girar o ombro."],
  ["mergulho-banco", "Tríceps no banco", "Tríceps", "Peso corporal", 3, "10", 75, "Extensão de cotovelos com apoio no banco.", "Mantenha os ombros longe das orelhas e desça somente até onde o ombro ficar confortável."],
  ["abdominal-cabo", "Abdominal na polia", "Abdômen", "Cabo", 3, "15", 45, "Flexão de tronco resistida na polia.", "Enrole o tronco levando as costelas em direção à pelve, sem puxar com os braços."],
  ["abdominal-roda", "Abdominal com roda", "Abdômen", "Roda abdominal", 3, "8", 75, "Anti-extensão do tronco com roda abdominal.", "Comece com amplitude curta e mantenha glúteos e abdômen contraídos."],
  ["dead-bug", "Dead bug", "Abdômen", "Peso corporal", 3, "10", 45, "Estabilização lombo-pélvica no solo.", "Mantenha a lombar próxima ao chão e mova braços e pernas lentamente."],
  ["bird-dog", "Bird dog", "Abdômen", "Peso corporal", 3, "10", 45, "Estabilização contralateral do tronco.", "Estenda braço e perna opostos sem girar a pelve e retorne com controle."],
  ["prancha-lateral", "Prancha lateral", "Abdômen", "Peso corporal", 3, "30", 45, "Isometria lateral para oblíquos e estabilizadores.", "Mantenha o corpo em linha e eleve o quadril sem deixar o tronco girar."],
  ["mountain-climber", "Mountain climber", "Condicionamento", "Peso corporal", 3, "30s", 45, "Movimento dinâmico de condicionamento com apoio das mãos.", "Mantenha os ombros sobre as mãos e alterne os joelhos sem perder a estabilidade do tronco."],
  ["polichinelo", "Polichinelo", "Condicionamento", "Peso corporal", 3, "30s", 30, "Exercício cíclico de corpo inteiro para aquecimento e condicionamento.", "Aterrisse suavemente, mantenha ritmo confortável e reduza o impacto se necessário."],
  ["burpee", "Burpee", "Condicionamento", "Peso corporal", 3, "10", 60, "Sequência de agachamento e apoio frontal que combina transições rápidas de corpo inteiro para condicionamento.", "Agache e apoie as mãos no chão, leve os pés para trás em prancha, retorne sob o quadril e fique em pé com controle."],
  ["pular-corda", "Pular corda", "Condicionamento", "Corda", 3, "60s", 30, "Saltos baixos e repetidos com rotação de corda para desenvolver resistência cardiorrespiratória e coordenação.", "Mantenha os cotovelos próximos ao corpo, gire a corda pelos punhos e faça saltos curtos com aterrissagem leve."],
  ["corrida-estacionaria", "Corrida estacionária com joelhos altos", "Condicionamento", "Peso corporal", 3, "30s", 30, "Corrida no mesmo lugar alternando elevação dos joelhos e balanço dos braços para elevar a frequência cardíaca.", "Mantenha o tronco ereto, alterne os joelhos sem perder o equilíbrio e ajuste a altura e o ritmo ao seu condicionamento."],
  ["caminhada-elastico", "Caminhada lateral com elástico", "Glúteos", "Elástico", 3, "12 passos", 45, "Passos laterais com tensão contínua nos abdutores.", "Mantenha os joelhos alinhados e dê passos curtos sem deixar o elástico perder tensão."],
  ["levantamento-lateral-caneleira", "Elevação lateral de perna", "Glúteos", "Caneleira", 3, "15", 45, "Abdução de quadril com caneleira ou peso leve.", "Apoie-se com estabilidade, mantenha a ponta do pé neutra e eleve sem inclinar o tronco."],
];

export const EXERCISE_CATALOG: ExerciseDefinition[] = rows.map(([id, name, muscle, equipment, defaultSets, defaultReps, defaultRestSeconds, description, instructions]) => ({
  id, name, muscle, equipment, defaultSets, defaultReps, defaultRestSeconds, description, instructions, imageUrl: EXERCISE_IMAGES[id], purpose: EXERCISE_FOCUS[id as keyof typeof EXERCISE_FOCUS]?.purpose ?? description, primaryMuscles: EXERCISE_FOCUS[id as keyof typeof EXERCISE_FOCUS]?.primaryMuscles ?? [muscle], secondaryMuscles: EXERCISE_FOCUS[id as keyof typeof EXERCISE_FOCUS]?.secondaryMuscles ?? [],
}));

export const DAYS: Array<{ key: DayKey; label: string; short: string }> = [
  { key: "seg", label: "Segunda-feira", short: "SEG" },
  { key: "ter", label: "Terça-feira", short: "TER" },
  { key: "qua", label: "Quarta-feira", short: "QUA" },
  { key: "qui", label: "Quinta-feira", short: "QUI" },
  { key: "sex", label: "Sexta-feira", short: "SEX" },
  { key: "sab", label: "Sábado", short: "SÁB" },
  { key: "dom", label: "Domingo", short: "DOM" },
];

export const WORKOUT_COLORS = ["#b8f32b", "#75bd26", "#39a77a", "#38a9c2", "#9478e8", "#e38d36"];

export function makeId(prefix = "bf"): string {
  return `${prefix}-${globalThis.crypto?.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`}`;
}

export function makeWorkoutExercise(definition: ExerciseDefinition): WorkoutExercise {
  const sets: ExerciseSet[] = Array.from({ length: Math.min(10, Math.max(1, definition.defaultSets)) }, () => ({
    id: makeId("set"), reps: definition.defaultReps, weight: "", method: "Repetições", seconds: 45,
  }));
  return { ...definition, sets, restSeconds: definition.defaultRestSeconds, note: "" };
}

export function makeStarterWorkouts(): Workout[] {
  const get = (id: string) => EXERCISE_CATALOG.find((item) => item.id === id)!;
  const now = new Date().toISOString();
  const starters: Array<{ title: string; description: string; days: DayKey[]; color: string; exercises: string[] }> = [
    { title: "Treino A", description: "Glúteos + posterior", days: ["seg"], color: WORKOUT_COLORS[0], exercises: ["hip-thrust", "stiff", "flexora", "abducao"] },
    { title: "Treino B", description: "Pernas completas", days: ["qua"], color: WORKOUT_COLORS[2], exercises: ["agachamento", "leg-press", "extensora", "panturrilha"] },
    { title: "Treino C", description: "Superior + postura", days: ["sex"], color: WORKOUT_COLORS[3], exercises: ["puxada-frontal", "remada-baixa", "supino", "elevacao-lateral"] },
  ];
  return starters.map((item) => ({
    id: makeId("workout"), title: item.title, description: item.description, days: item.days, color: item.color,
    exercises: item.exercises.map((id) => makeWorkoutExercise(get(id))), createdAt: now, updatedAt: now,
  }));
}
