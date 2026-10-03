import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Check, CheckCircle2, ChevronLeft, ChevronRight, Clock3, Dumbbell, Pause, Play, SkipForward, Volume2, Vibrate } from "lucide-react";
import type { BellaData, PerformedSet, Workout } from "../types";
import { Button, Card, Pill } from "../components/common";

function formatTime(seconds: number) {
  const safe = Math.max(0, seconds);
  return `${String(Math.floor(safe / 60)).padStart(2, "0")}:${String(safe % 60).padStart(2, "0")}`;
}

function formatElapsed(startedAt: string) {
  return Math.max(0, Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000));
}

export default function WorkoutRunner({ workout, data, onUpdate, onFinish, onExit }: {
  workout: Workout;
  data: BellaData;
  onUpdate: (active: BellaData["activeWorkout"]) => void;
  onFinish: (performed: PerformedSet[], startedAt: string) => void;
  onExit: () => void;
}) {
  const [, setClock] = useState(Date.now());
  const [restLeft, setRestLeft] = useState<number | null>(null);
  const [restPaused, setRestPaused] = useState(false);
  const [completion, setCompletion] = useState(false);
  const active = data.activeWorkout;

  useEffect(() => {
    const id = window.setInterval(() => setClock(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (restLeft === null || restPaused) return;
    if (restLeft <= 0) {
      setRestLeft(null);
      setCompletion(true);
      if (data.settings.vibration && "vibrate" in navigator) navigator.vibrate([180, 80, 180]);
      if (data.settings.sound) {
        try {
          const audio = new AudioContext();
          const oscillator = audio.createOscillator();
          const gain = audio.createGain();
          oscillator.frequency.value = 660;
          gain.gain.value = 0.08;
          oscillator.connect(gain);
          gain.connect(audio.destination);
          oscillator.start();
          oscillator.stop(audio.currentTime + 0.22);
        } catch { /* Som opcional; não interromper o treino se indisponível. */ }
      }
      return;
    }
    const timer = window.setTimeout(() => setRestLeft((value) => value === null ? null : value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [restLeft, restPaused, data.settings.vibration, data.settings.sound]);

  const exercise = workout.exercises[active?.exerciseIndex ?? 0];
  const set = exercise?.sets[active?.setIndex ?? 0];
  const countTotal = workout.exercises.reduce((sum, item) => sum + item.sets.length, 0);
  const countDone = active?.performed.length ?? 0;
  const elapsed = active ? formatElapsed(active.startedAt) : 0;
  const completedSetKeys = new Set(active?.performed.map((item) => `${item.exerciseIndex}:${item.setIndex}`) ?? []);
  const progress = countTotal ? Math.min(100, (countDone / countTotal) * 100) : 0;
  const allSetsDone = !!active && countTotal > 0 && countDone >= countTotal;
  const currentSetDone = !!active && active.performed.some((item) => item.exerciseIndex === active.exerciseIndex && item.setIndex === active.setIndex);
  const previousSession = data.history
    .slice()
    .sort((a, b) => b.finishedAt.localeCompare(a.finishedAt))
    .find((session) => session.performed.some((item) => item.exerciseName === exercise?.name && item.weight !== ""));
  const previousSet = previousSession?.performed.slice().reverse().find((item) => item.exerciseName === exercise?.name && item.weight !== "");
  const previousWeight = previousSet ? Number(previousSet.weight) * (previousSession?.weightUnit && previousSession.weightUnit !== data.settings.weightUnit ? (previousSession.weightUnit === "lb" ? 0.45359237 : 1 / 0.45359237) : 1) : null;
  const previousWeightLabel = previousWeight === null ? "" : `${Number(previousWeight.toFixed(1))} ${data.settings.weightUnit}`;
  const next = useMemo(() => {
    if (!active) return null;
    for (let exerciseIndex = 0; exerciseIndex < workout.exercises.length; exerciseIndex++) {
      for (let setIndex = 0; setIndex < workout.exercises[exerciseIndex].sets.length; setIndex++) {
        if (!active.performed.some((item) => item.exerciseIndex === exerciseIndex && item.setIndex === setIndex)) return { exerciseIndex, setIndex };
      }
    }
    return null;
  }, [active?.performed, workout.exercises]);

  function completeCurrentSet() {
    if (!active || !exercise || !set || active.performed.some((item) => item.exerciseIndex === active.exerciseIndex && item.setIndex === active.setIndex)) return;
    const result: PerformedSet = {
      exerciseIndex: active.exerciseIndex,
      setIndex: active.setIndex,
      exerciseName: exercise.name,
      reps: set.reps,
      weight: set.weight,
      method: set.method,
      seconds: set.seconds,
      completedAt: new Date().toISOString(),
    };
    const performed = [...active.performed, result];
    let nextUnfinished: { exerciseIndex: number; setIndex: number } | null = null;
    for (let exerciseIndex = 0; exerciseIndex < workout.exercises.length && !nextUnfinished; exerciseIndex++) {
      for (let setIndex = 0; setIndex < workout.exercises[exerciseIndex].sets.length; setIndex++) {
        if (!performed.some((item) => item.exerciseIndex === exerciseIndex && item.setIndex === setIndex)) {
          nextUnfinished = { exerciseIndex, setIndex };
          break;
        }
      }
    }
    onUpdate({ ...active, performed, ...(nextUnfinished ?? { exerciseIndex: active.exerciseIndex, setIndex: active.setIndex }) });
    setCompletion(true);
    if (nextUnfinished && exercise.restSeconds > 0) setRestLeft(exercise.restSeconds);
  }

  function finish() {
    if (active) onFinish(active.performed, active.startedAt);
  }

  function moveTo(target: { exerciseIndex: number; setIndex: number } | null) {
    if (!active || !target) return;
    onUpdate({ ...active, ...target });
    setRestLeft(null);
    setRestPaused(false);
    setCompletion(false);
  }

  function skipRest() {
    setRestLeft(null);
    setRestPaused(false);
    setCompletion(false);
  }

  function adjustRest(delta: number) {
    setRestLeft((value) => Math.max(0, (value ?? 0) + delta));
  }

  if (!active || !exercise || !set) {
    return <div className="page"><div className="runner-empty"><Dumbbell size={30} /><h2>Prepare seu treino</h2><p>Não há séries disponíveis nesta rotina. Adicione exercícios no editor para iniciar.</p><Button onClick={onExit}>VOLTAR</Button></div></div>;
  }

  const previousSetTarget = active.setIndex > 0
    ? { exerciseIndex: active.exerciseIndex, setIndex: active.setIndex - 1 }
    : active.exerciseIndex > 0
      ? { exerciseIndex: active.exerciseIndex - 1, setIndex: workout.exercises[active.exerciseIndex - 1].sets.length - 1 }
      : null;

  return <div className="runner-page page">
    <div className="runner-top">
      <button className="back-link" onClick={onExit}><ArrowLeft size={16} /> SAIR DO TREINO</button>
      <div className="runner-top-center"><Pill tone="rose">{workout.title.toUpperCase()}</Pill><span>{formatTime(elapsed)} EM ANDAMENTO</span></div>
      <span className="runner-session-dot"><span /> AO VIVO</span>
    </div>
    <div className="runner-progress"><div className="runner-progress-label"><span>SEU TREINO EM ANDAMENTO</span><span><b>{countDone}</b> / {countTotal} séries</span></div><div className="runner-progress-track"><i style={{ width: `${progress}%` }} /></div></div>
    <div className="runner-layout">
      <aside className="runner-queue"><div className="eyebrow">SEQUÊNCIA DO TREINO</div><div className="runner-queue-list">{workout.exercises.map((item, index) => <div key={`${item.id}-${index}`} className={`queue-exercise ${index === active.exerciseIndex ? "queue-active" : ""} ${item.sets.every((_, setIndex) => completedSetKeys.has(`${index}:${setIndex}`)) ? "queue-done" : ""}`}><div className="queue-number">{item.sets.every((_, setIndex) => completedSetKeys.has(`${index}:${setIndex}`)) ? <Check size={14} /> : String(index + 1).padStart(2, "0")}</div><div><strong>{item.name}</strong><small>{item.sets.length} séries · {item.muscle}</small></div></div>)}</div></aside>
      <main className="runner-focus">
        <div className="runner-exercise-head"><span className="eyebrow">EXERCÍCIO {String(active.exerciseIndex + 1).padStart(2, "0")} DE {String(workout.exercises.length).padStart(2, "0")}</span><span className="runner-muscle-tag">{exercise.muscle}</span></div>
        <h1>{exercise.name}</h1>
        <p className="runner-equipment">{exercise.equipment} · {exercise.sets.length} séries planejadas</p>
        <section className="runner-tech-focus" aria-label="Finalidade e ação muscular do exercício">
          <p>{exercise.purpose || exercise.description}</p>
          {exercise.primaryMuscles?.length ? <div><strong>Principal:</strong><span>{exercise.primaryMuscles.join(" · ")}</span></div> : null}
          {exercise.secondaryMuscles?.length ? <div><strong>Auxiliares / estabilizadores:</strong><span>{exercise.secondaryMuscles.join(" · ")}</span></div> : null}
        </section>
        <div className="runner-demo"><div className="exercise-art-ring large" /><Dumbbell size={65} /><span>EXECUTE COM CONTROLE</span>{exercise.imageUrl && <img src={exercise.imageUrl} alt={`Demonstração de ${exercise.name}`} onError={(event) => { event.currentTarget.style.display = "none"; }} />}<Pill tone="neutral"><Clock3 size={12} />{exercise.restSeconds}s descanso</Pill></div>
        {exercise.note && <div className="runner-note"><span>LEMBRETE</span><p>{exercise.note}</p></div>}
        {(completion || currentSetDone) && <div className="set-completed-banner" role="status"><CheckCircle2 size={16} /><span>SÉRIE CONCLUÍDA</span><small>{allSetsDone ? "Rotina completa — parabéns pela constância." : "Você está construindo sua força, série por série."}</small></div>}
        {allSetsDone ? <Card className="set-focus workout-complete"><span className="eyebrow">ROTINA COMPLETA</span><h2>Você fez acontecer.</h2><p>{countTotal} séries concluídas neste treino. Seu progresso será registrado no histórico.</p><Button size="lg" className="complete-set-button" onClick={finish}>FINALIZAR TREINO <CheckCircle2 size={19} /></Button></Card>
          : restLeft !== null ? <Card className={`rest-timer ${restLeft === 0 ? "timer-done" : ""}`}><span className="eyebrow">{restLeft === 0 ? "DESCANSO FINALIZADO" : "TEMPO PARA VOCÊ"}</span><div className="timer-display">{formatTime(restLeft)}</div><div className="rest-timer-label"><span /> DESCANSO</div><div className="rest-controls"><Button variant="outline" size="sm" onClick={() => adjustRest(-15)}>-15s</Button><Button variant="outline" size="sm" onClick={() => adjustRest(15)}>+15s</Button><Button variant="ghost" size="sm" onClick={() => setRestPaused((paused) => !paused)}>{restPaused ? <Play size={13} /> : <Pause size={13} />} {restPaused ? "RETOMAR" : "PAUSAR"}</Button><Button variant="secondary" size="sm" onClick={skipRest}><SkipForward size={13} /> PULAR</Button></div></Card>
            : <Card className="set-focus"><div className="set-focus-head"><span className="set-focus-count">SÉRIE {String(active.setIndex + 1).padStart(2, "0")}</span><Pill tone="rose">{set.method.toUpperCase()}</Pill></div><div className="set-target-grid"><div><small>{set.method === "Tempo" || set.method === "Isometria" ? "DURAÇÃO" : "REPETIÇÕES"}</small><strong>{set.method === "Tempo" || set.method === "Isometria" ? `${set.seconds} s` : set.reps}</strong></div><div><small>{previousSet ? "CARGA HOJE" : "CARGA"}</small><strong>{set.weight ? `${set.weight} ${data.settings.weightUnit}` : "Peso corporal"}</strong></div><div><small>DESCANSO</small><strong>{formatTime(exercise.restSeconds)}</strong></div></div>{previousSet && <div className="runner-last-time"><span>ÚLTIMA VEZ</span><strong>{previousWeightLabel}</strong><span>· {previousSet.reps} reps</span></div>}<Button size="lg" className="complete-set-button" disabled={currentSetDone} onClick={completeCurrentSet}>{currentSetDone ? <CheckCircle2 size={20} /> : <CheckCircle2 size={20} />} {currentSetDone ? "SÉRIE JÁ REGISTRADA" : "CONCLUIR ESTA SÉRIE"}</Button></Card>}
        <div className="runner-navigation"><button type="button" onClick={() => moveTo(previousSetTarget)} disabled={!previousSetTarget}><ChevronLeft size={15} /> SÉRIE ANTERIOR</button>{next && <button type="button" onClick={() => moveTo(next)}><ChevronRight size={15} /> PRÓXIMA SÉRIE</button>}</div>
        <div className="runner-end-actions"><button type="button" className="finish-early" onClick={finish}>Concluir treino agora</button><span><Vibrate size={12} /> Vibração {data.settings.vibration ? "ativada" : "desativada"} · <Volume2 size={12} /> Som {data.settings.sound ? "ativado" : "desativado"}</span></div>
      </main>
    </div>
  </div>;
}
