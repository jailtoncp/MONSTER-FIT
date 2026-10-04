export interface ExerciseFocus {
  purpose: string;
  primaryMuscles: string[];
  secondaryMuscles: string[];
}

/**
 * Descrições anatômicas por exercício e execução cadastrada em catalog.ts.
 * "Principal" descreve os agonistas mais envolvidos; auxiliares também podem
 * trabalhar, mas sua contribuição depende de técnica, amplitude e anatomia.
 */
export const EXERCISE_FOCUS = {
  "rotacao-externa-cabo": { purpose: "Rotação externa do ombro com resistência do cabo, enfatizando infraespinal e redondo menor e exigindo estabilização da articulação.", primaryMuscles: ["Infraespinal", "Redondo menor"], secondaryMuscles: ["Deltoide posterior", "Estabilizadores da escápula"] },
  "rotacao-interna-cabo": { purpose: "Rotação interna do ombro contra resistência, com ênfase no subescapular e na estabilidade glenoumeral.", primaryMuscles: ["Subescapular"], secondaryMuscles: ["Peitoral maior", "Latíssimo do dorso", "Redondo maior"] },
  "rotacao-externa-halter-deitado": { purpose: "Rotação externa de baixa carga realizada deitado de lado para treinar controle e resistência dos rotadores externos.", primaryMuscles: ["Infraespinal", "Redondo menor"], secondaryMuscles: ["Deltoide posterior"] },
  "rotacao-externa-halter-em-pe": { purpose: "Rotação externa do ombro com halter e cotovelo estabilizado junto ao tronco.", primaryMuscles: ["Infraespinal", "Redondo menor"], secondaryMuscles: ["Deltoide posterior", "Estabilizadores da escápula"] },
  "hip-thrust": {
    purpose: "Extensão do quadril com o tronco apoiado; favorece a produção de força dos extensores do quadril, com ênfase no glúteo máximo.",
    primaryMuscles: ["Glúteo máximo"],
    secondaryMuscles: ["Isquiotibiais", "Adutor magno", "Glúteo médio (estabilização pélvica)"],
  },
  "elevacao-pelvica": {
    purpose: "Extensão do quadril a partir do solo; treina sobretudo o glúteo máximo, especialmente ao elevar e estabilizar a pelve.",
    primaryMuscles: ["Glúteo máximo"],
    secondaryMuscles: ["Isquiotibiais", "Adutor magno", "Abdômen (estabilização do tronco)"],
  },
  "glute-bridge": {
    purpose: "Ponte de quadril com peso corporal; desenvolve controle e força dos extensores do quadril, com ênfase no glúteo máximo.",
    primaryMuscles: ["Glúteo máximo"],
    secondaryMuscles: ["Isquiotibiais", "Adutor magno", "Abdômen (estabilização do tronco)"],
  },
  coice: {
    purpose: "Extensão unilateral do quadril contra o cabo; enfatiza a extensão do quadril sem depender de impulso do tronco.",
    primaryMuscles: ["Glúteo máximo"],
    secondaryMuscles: ["Isquiotibiais", "Glúteo médio (estabilização da pelve)", "Abdômen e extensores da coluna (estabilização)"],
  },
  abducao: {
    purpose: "Abdução do quadril sentado; treina os abdutores que afastam a coxa da linha média e contribuem para estabilizar a pelve.",
    primaryMuscles: ["Glúteo médio", "Glúteo mínimo"],
    secondaryMuscles: ["Tensor da fáscia lata", "Fibras superiores do glúteo máximo"],
  },
  "agachamento-sumo": {
    purpose: "Agachamento com base ampla; combina extensão de quadril e joelho, exigindo glúteos, quadríceps e adutores conforme a amplitude e a técnica.",
    primaryMuscles: ["Glúteo máximo", "Quadríceps", "Adutor magno"],
    secondaryMuscles: ["Isquiotibiais", "Adutores longo e curto", "Abdômen e extensores da coluna (estabilização)"],
  },
  agachamento: {
    purpose: "Padrão multiarticular de flexão e extensão de quadril e joelhos; desenvolve força de membros inferiores e controle do tronco.",
    primaryMuscles: ["Quadríceps", "Glúteo máximo"],
    secondaryMuscles: ["Adutor magno", "Isquiotibiais", "Abdômen e extensores da coluna (estabilização)"],
  },
  "leg-press": {
    purpose: "Empurrada guiada que combina extensão de quadril e joelho; a posição dos pés altera a ênfase, mas não isola um músculo específico.",
    primaryMuscles: ["Quadríceps", "Glúteo máximo"],
    secondaryMuscles: ["Adutor magno", "Isquiotibiais", "Panturrilhas (estabilização do tornozelo)"],
  },
  hack: {
    purpose: "Agachamento guiado em máquina; enfatiza a extensão dos joelhos e quadris, permitindo estabilização do tronco pelo encosto.",
    primaryMuscles: ["Quadríceps", "Glúteo máximo"],
    secondaryMuscles: ["Adutor magno", "Isquiotibiais"],
  },
  extensora: {
    purpose: "Extensão do joelho sentado contra resistência; trabalha diretamente o grupo quadríceps na face anterior da coxa.",
    primaryMuscles: ["Quadríceps (reto femoral e vastos medial, lateral e intermédio)"],
    secondaryMuscles: [],
  },
  flexora: {
    purpose: "Flexão dos joelhos contra resistência; trabalha os músculos posteriores da coxa mantendo o quadril apoiado na máquina.",
    primaryMuscles: ["Isquiotibiais (bíceps femoral, semitendíneo e semimembranoso)"],
    secondaryMuscles: ["Gastrocnêmio"],
  },
  stiff: {
    purpose: "Dobradiça do quadril com joelhos levemente flexionados; carrega os extensores do quadril enquanto o tronco mantém a coluna estável.",
    primaryMuscles: ["Isquiotibiais", "Glúteo máximo"],
    secondaryMuscles: ["Adutor magno", "Extensores da coluna (estabilização isométrica)"],
  },
  afundo: {
    purpose: "Agachamento unilateral em posição dividida; exige extensão de quadril e joelho e controle da pelve e do equilíbrio.",
    primaryMuscles: ["Quadríceps", "Glúteo máximo"],
    secondaryMuscles: ["Isquiotibiais", "Adutor magno", "Glúteo médio (estabilização pélvica)", "Panturrilhas"],
  },
  passada: {
    purpose: "Avanço alternado com deslocamento; treina força unilateral dos membros inferiores e controle durante a troca de apoio.",
    primaryMuscles: ["Quadríceps", "Glúteo máximo"],
    secondaryMuscles: ["Isquiotibiais", "Adutor magno", "Glúteo médio (estabilização pélvica)", "Panturrilhas"],
  },
  panturrilha: {
    purpose: "Flexão plantar do tornozelo; eleva o calcanhar contra resistência e trabalha o tríceps sural.",
    primaryMuscles: ["Gastrocnêmio", "Sóleo"],
    secondaryMuscles: ["Fibulares e musculatura intrínseca do pé (estabilização)"],
  },
  "puxada-frontal": {
    purpose: "Puxada vertical à frente do tronco; combina adução e extensão do ombro com flexão do cotovelo para tracionar a carga.",
    primaryMuscles: ["Latíssimo do dorso", "Redondo maior"],
    secondaryMuscles: ["Bíceps braquial", "Braquial", "Braquiorradial", "Romboides e trapézio médio/inferior"],
  },
  "remada-baixa": {
    purpose: "Remada horizontal sentada; aproxima o braço do tronco e retrai as escápulas, exigindo controle do tronco.",
    primaryMuscles: ["Latíssimo do dorso", "Romboides", "Trapézio médio"],
    secondaryMuscles: ["Deltoide posterior", "Bíceps braquial", "Braquial", "Braquiorradial"],
  },
  "remada-unilateral": {
    purpose: "Remada horizontal unilateral apoiada; trabalha a tração de um lado por vez e demanda estabilidade anti-rotação do tronco.",
    primaryMuscles: ["Latíssimo do dorso", "Romboides", "Trapézio médio"],
    secondaryMuscles: ["Deltoide posterior", "Bíceps braquial", "Braquial", "Oblíquos (estabilização anti-rotação)"],
  },
  "remada-curvada": {
    purpose: "Remada horizontal com o tronco inclinado; combina extensão do ombro e retração escapular, mantendo o tronco em contração isométrica.",
    primaryMuscles: ["Latíssimo do dorso", "Romboides", "Trapézio médio"],
    secondaryMuscles: ["Deltoide posterior", "Bíceps braquial", "Braquial", "Extensores da coluna (estabilização)"],
  },
  supino: {
    purpose: "Press horizontal deitado; o peitoral maior produz a adução horizontal do braço, enquanto o cotovelo se estende para mover a barra.",
    primaryMuscles: ["Peitoral maior"],
    secondaryMuscles: ["Deltoide anterior", "Tríceps braquial", "Serrátil anterior (estabilização escapular)"],
  },
  crucifixo: {
    purpose: "Adução horizontal dos ombros com cotovelos levemente flexionados; enfatiza o peitoral maior, sem transformar o gesto em um press.",
    primaryMuscles: ["Peitoral maior"],
    secondaryMuscles: ["Deltoide anterior", "Manguito rotador (estabilização do ombro)"],
  },
  crossover: {
    purpose: "Adução horizontal dos ombros contra cabos; a altura das polias modifica a linha de tração, sem isolar uma porção do peitoral.",
    primaryMuscles: ["Peitoral maior"],
    secondaryMuscles: ["Deltoide anterior", "Serrátil anterior (controle escapular)"],
  },
  "elevacao-lateral": {
    purpose: "Elevação dos braços lateralmente no plano escapular; enfatiza a abdução do ombro e o desenvolvimento do deltoide lateral.",
    primaryMuscles: ["Deltoide lateral (porção média)"],
    secondaryMuscles: ["Supraespinal", "Trapézio superior e serrátil anterior (rotação superior da escápula)"],
  },
  "elevacao-frontal": {
    purpose: "Elevação anterior do braço; treina a flexão do ombro com maior participação da porção anterior do deltoide.",
    primaryMuscles: ["Deltoide anterior"],
    secondaryMuscles: ["Peitoral maior (porção clavicular)", "Serrátil anterior", "Trapézio (rotação superior da escápula)"],
  },
  desenvolvimento: {
    purpose: "Press vertical acima da cabeça; combina flexão/abdução do ombro e extensão do cotovelo com rotação superior das escápulas.",
    primaryMuscles: ["Deltoide anterior", "Deltoide lateral"],
    secondaryMuscles: ["Tríceps braquial", "Peitoral maior (porção clavicular)", "Trapézio e serrátil anterior"],
  },
  "rosca-direta": {
    purpose: "Flexão do cotovelo com pegada supinada; combina flexão do cotovelo e supinação do antebraço.",
    primaryMuscles: ["Bíceps braquial", "Braquial"],
    secondaryMuscles: ["Braquiorradial", "Músculos do antebraço (estabilização da pegada)"],
  },
  "rosca-alternada": {
    purpose: "Flexão alternada dos cotovelos com halteres; permite trabalhar cada lado separadamente e pode incluir supinação do antebraço.",
    primaryMuscles: ["Bíceps braquial", "Braquial"],
    secondaryMuscles: ["Braquiorradial", "Músculos do antebraço (estabilização da pegada)"],
  },
  "rosca-martelo": {
    purpose: "Flexão do cotovelo com pegada neutra; aumenta a demanda relativa sobre braquial e braquiorradial sem retirar a participação do bíceps.",
    primaryMuscles: ["Braquial", "Braquiorradial"],
    secondaryMuscles: ["Bíceps braquial", "Músculos do antebraço (estabilização da pegada)"],
  },
  "triceps-pulley": {
    purpose: "Extensão do cotovelo contra a polia alta com o braço junto ao tronco; trabalha o tríceps braquial ao estender o antebraço.",
    primaryMuscles: ["Tríceps braquial (cabeças lateral, medial e longa)"],
    secondaryMuscles: ["Ancôneo", "Deltoide e musculatura escapular (estabilização do braço)"],
  },
  "triceps-frances": {
    purpose: "Extensão do cotovelo acima da cabeça; a posição elevada do braço coloca a cabeça longa do tríceps em maior alongamento.",
    primaryMuscles: ["Tríceps braquial (ênfase funcional na cabeça longa)"],
    secondaryMuscles: ["Demais cabeças do tríceps", "Ancôneo", "Manguito rotador (estabilização do ombro)"],
  },
  "triceps-testa-halteres-martelo": {
    purpose: "Extensão dos cotovelos deitado com dois halteres e pegada neutra; trabalha o tríceps com maior liberdade de trajetória para cada braço.",
    primaryMuscles: ["Tríceps braquial (cabeças longa, lateral e medial)"],
    secondaryMuscles: ["Ancôneo", "Manguito rotador e musculatura do ombro (estabilização)"],
  },
  "triceps-testa": {
    purpose: "Extensão dos cotovelos deitado com os braços elevados; fortalece o tríceps enquanto o ombro mantém a posição do úmero.",
    primaryMuscles: ["Tríceps braquial (cabeças longa, lateral e medial)"],
    secondaryMuscles: ["Ancôneo", "Manguito rotador (estabilização do ombro)"],
  },
  abdominal: {
    purpose: "Flexão controlada do tronco; aproxima caixa torácica e pelve, enfatizando a musculatura abdominal anterior.",
    primaryMuscles: ["Reto abdominal"],
    secondaryMuscles: ["Oblíquo externo", "Oblíquo interno"],
  },
  prancha: {
    purpose: "Isometria anti-extensão do tronco; resiste à queda da pelve e mantém tronco e quadris alinhados sob carga gravitacional.",
    primaryMuscles: ["Reto abdominal", "Transverso do abdome", "Oblíquos interno e externo"],
    secondaryMuscles: ["Glúteo máximo", "Multífidos e extensores da coluna", "Serrátil anterior", "Deltoide anterior"],
  },
  "elevacao-pernas": {
    purpose: "Flexão de quadril com joelhos estendidos; os flexores do quadril elevam as pernas, enquanto a parede abdominal controla a posição da pelve e da lombar.",
    primaryMuscles: ["Iliopsoas", "Reto femoral (auxilia na flexão do quadril)"],
    secondaryMuscles: ["Reto abdominal", "Oblíquos interno e externo (estabilização lombo-pélvica)"],
  },
  burpee: {
    purpose: "Transição dinâmica entre agachamento e apoio frontal; aumenta a demanda cardiorrespiratória e envolve força e coordenação de corpo inteiro.",
    primaryMuscles: ["Quadríceps", "Glúteo máximo", "Peitoral maior"],
    secondaryMuscles: ["Tríceps braquial", "Deltoides", "Abdômen (estabilização)", "Panturrilhas"],
  },
  "pular-corda": {
    purpose: "Saltos cíclicos de baixo deslocamento com rotação da corda; treina resistência cardiorrespiratória, ritmo e coordenação.",
    primaryMuscles: ["Panturrilhas", "Quadríceps"],
    secondaryMuscles: ["Glúteos", "Deltoides e antebraços (rotação da corda)", "Core (estabilização)"],
  },
  "corrida-estacionaria": {
    purpose: "Corrida no mesmo lugar com elevação alternada dos joelhos; estimula a capacidade cardiorrespiratória e a coordenação dos membros.",
    primaryMuscles: ["Quadríceps", "Glúteos", "Flexores do quadril"],
    secondaryMuscles: ["Isquiotibiais", "Panturrilhas", "Abdômen (estabilização do tronco)"],
  },
  "landmine-unilateral-ombro": {
    purpose: "Desenvolvimento unilateral com trajetória diagonal do landmine; enfatiza o deltoide anterior e exige estabilização do tronco contra inclinação e rotação.",
    primaryMuscles: ["Deltoide anterior", "Deltoide lateral"],
    secondaryMuscles: ["Tríceps braquial", "Peitoral maior (porção clavicular)", "Serrátil anterior", "Core", "Manguito rotador (estabilização)"],
  },
  "thruster-crossfit": {"purpose":"Movimento composto que combina agachamento frontal e desenvolvimento, elevando a demanda de força e condicionamento.","primaryMuscles":["Quadríceps","Glúteo máximo","Deltoide anterior"],"secondaryMuscles":["Tríceps","Core","Deltoide lateral"]},
  "power-clean-crossfit": {"purpose":"Levantamento olímpico explosivo que desenvolve potência principalmente pela extensão coordenada de quadril e joelhos.","primaryMuscles":["Glúteo máximo","Isquiotibiais","Quadríceps"],"secondaryMuscles":["Trapézio","Deltoides","Core","Antebraços"]},
  "kettlebell-swing-crossfit": {"purpose":"Movimento balístico de dobradiça do quadril para potência e condicionamento.","primaryMuscles":["Glúteo máximo","Isquiotibiais"],"secondaryMuscles":["Eretores da coluna","Core","Deltoides","Antebraços"]},
  "pull-up-crossfit": {"purpose":"Puxada do peso corporal que desenvolve força de dorsais e flexores do cotovelo.","primaryMuscles":["Latíssimo do dorso","Bíceps braquial"],"secondaryMuscles":["Redondo maior","Braquial","Trapézio inferior","Core"]},
  "push-press-crossfit": {"purpose":"Desenvolvimento acima da cabeça com impulso das pernas para produzir mais força e potência.","primaryMuscles":["Deltoide anterior","Tríceps"],"secondaryMuscles":["Deltoide lateral","Trapézio","Quadríceps","Glúteos","Core"]},
  "box-jump-crossfit": {"purpose":"Salto explosivo para uma caixa que combina extensão rápida de quadril, joelhos e tornozelos, desenvolvendo potência e condicionamento.","primaryMuscles":["Quadríceps","Glúteo máximo","Panturrilhas"],"secondaryMuscles":["Isquiotibiais","Core","Deltoides e braços (balanço)"]},
  "box-jump-over-crossfit": {"purpose":"Salto para a caixa seguido de passagem para o lado oposto, aumentando a demanda de potência e condicionamento.","primaryMuscles":["Quadríceps","Glúteo máximo","Panturrilhas"],"secondaryMuscles":["Isquiotibiais","Core","Deltoides e braços (balanço)"]},
  "lateral-box-jump-crossfit": {"purpose":"Salto lateral explosivo para uma caixa, exigindo produção de força e estabilização no plano frontal.","primaryMuscles":["Quadríceps","Glúteo médio","Glúteo máximo"],"secondaryMuscles":["Panturrilhas","Isquiotibiais","Core"]},
  "single-leg-box-jump": {"purpose":"Salto unilateral para a caixa que exige potência de uma perna, estabilidade pélvica e controle da aterrissagem.","primaryMuscles":["Quadríceps","Glúteo máximo"],"secondaryMuscles":["Panturrilhas","Isquiotibiais","Glúteo médio","Core"]},
  "seated-box-jump": {"purpose":"Salto para a caixa iniciado sentado, reduzindo o contramovimento e enfatizando a produção explosiva de força dos membros inferiores.","primaryMuscles":["Quadríceps","Glúteo máximo"],"secondaryMuscles":["Panturrilhas","Isquiotibiais","Core"]},
  "burpee-box-jump": {"purpose":"Combinação de burpee e salto para a caixa que eleva a demanda cardiorrespiratória e envolve força e potência de corpo inteiro.","primaryMuscles":["Quadríceps","Glúteo máximo","Panturrilhas"],"secondaryMuscles":["Peitoral maior","Tríceps","Deltoides","Core","Isquiotibiais"]},
  "dumbbell-snatch-crossfit": {"purpose":"Movimento explosivo de corpo inteiro que desenvolve potência unilateral e condicionamento.","primaryMuscles":["Glúteo máximo","Quadríceps","Deltoide"],"secondaryMuscles":["Trapézio","Isquiotibiais","Core","Antebraços"]},
  "dumbbell-clean-crossfit": {"purpose":"Levantamento explosivo com halteres que combina extensão de quadril e joelhos com recepção na posição de front rack.","primaryMuscles":["Glúteo máximo","Quadríceps","Isquiotibiais"],"secondaryMuscles":["Deltoides","Trapézio","Core","Antebraços"]},
  "barbell-clean-and-press-crossfit": {"purpose":"Movimento composto que combina potência do clean com pressão acima da cabeça.","primaryMuscles":["Quadríceps","Glúteo máximo","Deltoide anterior"],"secondaryMuscles":["Isquiotibiais","Tríceps","Trapézio","Core"]},
  "kettlebell-double-snatch-crossfit": {"purpose":"Movimento balístico bilateral que desenvolve potência, coordenação e condicionamento.","primaryMuscles":["Deltoides","Glúteo máximo","Isquiotibiais"],"secondaryMuscles":["Quadríceps","Trapézio","Core","Antebraços"]},
  "jump-squat-crossfit": {"purpose":"Agachamento pliométrico que transforma força dos membros inferiores em potência e condicionamento.","primaryMuscles":["Quadríceps","Glúteo máximo","Panturrilhas"],"secondaryMuscles":["Isquiotibiais","Core"]},
  "jumping-lunge-crossfit": {"purpose":"Afundo pliométrico alternado que desenvolve potência, coordenação e condicionamento.","primaryMuscles":["Quadríceps","Glúteo máximo"],"secondaryMuscles":["Isquiotibiais","Panturrilhas","Core","Glúteo médio"]},
  "dumbbell-burpee-crossfit": {"purpose":"Burpee com carga externa que aumenta a demanda de força e condicionamento de corpo inteiro.","primaryMuscles":["Quadríceps","Glúteo máximo","Peitoral maior"],"secondaryMuscles":["Tríceps","Deltoides","Core","Isquiotibiais"]},
  "battle-rope-crossfit": {"purpose":"Movimento cíclico de alta demanda metabólica que combina resistência dos membros superiores e estabilização corporal.","primaryMuscles":["Deltoides","Antebraços"],"secondaryMuscles":["Trapézio","Latíssimo do dorso","Quadríceps","Glúteos","Core"]},
  "rope-climb-crossfit": {"purpose":"Escalada vertical que desenvolve força de puxada, pegada, coordenação e resistência.","primaryMuscles":["Latíssimo do dorso","Bíceps braquial","Antebraços"],"secondaryMuscles":["Quadríceps","Panturrilhas","Core","Trapézio"]},
  "medicine-ball-slam-crossfit": {"purpose":"Arremesso explosivo que desenvolve potência de membros superiores e do tronco, além de condicionamento.","primaryMuscles":["Deltoides","Reto abdominal","Latíssimo do dorso"],"secondaryMuscles":["Tríceps","Glúteos","Quadríceps","Antebraços"]},
  "shoulder-tap-push-up-crossfit": {"purpose":"Flexão com desafio anti-rotação que combina força de empurrar e estabilidade do tronco.","primaryMuscles":["Peitoral maior","Tríceps","Deltoide anterior"],"secondaryMuscles":["Core","Serrátil anterior","Glúteos"]},
  "handstand-push-up-crossfit": {"purpose":"Empurrada vertical avançada que desenvolve força de ombros, tríceps e estabilidade corporal.","primaryMuscles":["Deltoide anterior","Tríceps"],"secondaryMuscles":["Deltoide lateral","Trapézio","Peitoral maior","Core"]},
} satisfies Record<string, ExerciseFocus>;
