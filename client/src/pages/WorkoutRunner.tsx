import { useEffect, useState } from "react";
import { ArrowLeft, Check, CheckCircle2, ChevronLeft, ChevronRight, Clock3, Dumbbell, Pause, Play, SkipForward, Volume2, Vibrate } from "lucide-react";
import type { BellaData, PerformedSet, Workout } from "../types";
import { Button, Card, Pill } from "../components/common";
import { activeWorkoutElapsedSeconds, getAdjacentWorkoutSet } from "../lib/workoutSession";

function formatTime(seconds: number) {
  const safe = Math.max(0, seconds);
  return `${String(Math.floor(safe / 60)).padStart(2, "0")}:${String(safe % 60).padStart(2, "0")}`;
}

export default function WorkoutRunner({ workout, data, onUpdate, onResume, onFinish, onExit }: {
  workout: Workout;
  data: BellaData;
  onUpdate: (active: BellaData["activeWorkout"]) => void;
  onResume: () => void;
  onFinish: (performed: PerformedSet[], startedAt: string, durationSeconds: number) => void;
  onExit: () => void;
}) {
  const active = data.activeWorkout;
  const [, setClock] = useState(Date.now());
  const [restLeft, setRestLeft] = useState<number | null>(() => active?.restRemainingSeconds ?? null);
  const [restPaused, setRestPaused] = useState(() => Boolean(active?.restPaused || active?.isPaused));
  const [completion, setCompletion] = useState(false);

  useEffect(() => {
    const id = window.setInterval(() => setClock(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (!active) { setRestLeft(null); setRestPaused(false); return; }
    const deadline = active.restEndsAt ? Date.parse(active.restEndsAt) : NaN;
    const remaining = active.restPaused || active.isPaused
      ? active.restRemainingSeconds ?? null
      : Number.isFinite(deadline)
        ? Math.max(0, Math.ceil((deadline - Date.now()) / 1000))
        : active.restRemainingSeconds ?? null;
    setRestLeft(remaining);
    setRestPaused(Boolean(active.restPaused || active.isPaused));
  }, [active?.isPaused, active?.restEndsAt, active?.restPaused, active?.restRemainingSeconds]);

  useEffect(() => {
    if (restLeft === null || restPaused) return;
    if (restLeft <= 0) {
      setRestLeft(null);
      setCompletion(true);
      if (active) onUpdate({ ...active, restRemainingSeconds: null, restEndsAt: null, restPaused: false });
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
  }, [restLeft, restPaused, active, onUpdate, data.settings.vibration, data.settings.sound]);

  const exercise = workout.exercises[active?.exerciseIndex ?? 0];
  const set = exercise?.sets[active?.setIndex ?? 0];
  const countTotal = workout.exercises.reduce((sum, item) => sum + item.sets.length, 0);
  const countDone = active?.performed.length ?? 0;
  const elapsed = active ? activeWorkoutElapsedSeconds(active) : 0;
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
  const previousSetTarget = active ? getAdjacentWorkoutSet(workout.exercises, active.exerciseIndex, active.setIndex, -1) : null;
  const nextSetTarget = active ? getAdjacentWorkoutSet(workout.exercises, active.exerciseIndex, active.setIndex, 1) : null;
  const finalPosition = workout.exercises.flatMap((item, exerciseIndex) => item.sets.map((_, setIndex) => ({ exerciseIndex, setIndex }))).at(-1);
  const cursorIsFinal = Boolean(active && finalPosition && active.exerciseIndex === finalPosition.exerciseIndex && active.setIndex === finalPosition.setIndex);
  const showWorkoutComplete = allSetsDone && cursorIsFinal;

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
    const nextUnfinished = workout.exercises.flatMap((item, exerciseIndex) => item.sets.map((_, setIndex) => ({ exerciseIndex, setIndex }))).find((position) => !performed.some((item) => item.exerciseIndex === position.exerciseIndex && item.setIndex === position.setIndex)) ?? null;
    const nextRest = nextUnfinished && exercise.restSeconds > 0 ? exercise.restSeconds : null;
    onUpdate({ ...active, performed, ...(nextUnfinished ?? { exerciseIndex: active.exerciseIndex, setIndex: active.setIndex }), restRemainingSeconds: nextRest, restEndsAt: nextRest === null ? null : new Date(Date.now() + nextRest * 1000).toISOString(), restPaused: false });
    setCompletion(true);
    setRestPaused(false);
    setRestLeft(nextRest);
  }

  function finish() {
    if (active) onFinish(active.performed, active.startedAt, activeWorkoutElapsedSeconds(active));
  }

  function moveTo(target: { exerciseIndex: number; setIndex: number } | null) {
    if (!active || !target) return;
    onUpdate({ ...active, ...target, restRemainingSeconds: null, restEndsAt: null, restPaused: false });
    setRestLeft(null);
    setRestPaused(false);
    setCompletion(false);
  }

  function skipRest() {
    if (active) onUpdate({ ...active, restRemainingSeconds: null, restEndsAt: null, restPaused: false });
    setRestLeft(null);
    setRestPaused(false);
    setCompletion(false);
  }

  function adjustRest(delta: number) {
    const next = Math.max(0, (restLeft ?? 0) + delta);
    setRestLeft(next);
    if (active) onUpdate({ ...active, restRemainingSeconds: next, restEndsAt: restPaused || active.isPaused ? null : new Date(Date.now() + next * 1000).toISOString(), restPaused });
  }

  if (!active || !exercise || !set) {
    return <div className="page"><div className="runner-empty"><Dumbbell size={30} /><h2>Prepare seu treino</h2><p>Não há séries disponíveis nesta rotina. Adicione exercícios no editor para iniciar.</p><Button onClick={onExit}>VOLTAR</Button></div></div>;
  }

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
        {active.isPaused && <Card className="runner-paused-banner"><span><Pause size={17} /> TREINO PAUSADO</span><p>Seu exercício, série, descanso e tempo ativo foram salvos. O tempo fora do app não será contado.</p><Button onClick={onResume}><Play size={15} fill="currentColor" /> RETOMAR DE ONDE PAREI</Button></Card>}
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
        {showWorkoutComplete ? <Card className="set-focus workout-complete"><span className="eyebrow">ROTINA COMPLETA</span><h2>Você fez acontecer.</h2><p>{countTotal} séries concluídas neste treino. Seu progresso será registrado no histórico.</p><Button size="lg" className="complete-set-button" disabled={active.isPaused} onClick={finish}>{active.isPaused ? "RETOME PARA FINALIZAR" : "FINALIZAR TREINO"} <CheckCircle2 size={19} /></Button></Card>
          : restLeft !== null ? <Card className={`rest-timer ${restLeft === 0 ? "timer-done" : ""}`}><span className="eyebrow">{restLeft === 0 ? "DESCANSO FINALIZADO" : "TEMPO PARA VOCÊ"}</span><div className="timer-display">{formatTime(restLeft)}</div><div className="rest-timer-label"><span /> {restPaused ? "DESCANSO PAUSADO" : "DESCANSO"}</div><div className="rest-controls"><Button variant="outline" size="sm" className="rest-action rest-adjust-button" aria-label="Diminuir descanso em 15 segundos" disabled={active.isPaused} onClick={() => adjustRest(-15)}>-15s</Button><Button variant="outline" size="sm" className="rest-action rest-adjust-button" aria-label="Aumentar descanso em 15 segundos" disabled={active.isPaused} onClick={() => adjustRest(15)}>+15s</Button><Button variant="ghost" size="sm" className="rest-action rest-pause-button" disabled={active.isPaused} onClick={() => { const paused = !restPaused; setRestPaused(paused); if (active) onUpdate({ ...active, restRemainingSeconds: restLeft, restEndsAt: paused ? null : new Date(Date.now() + restLeft * 1000).toISOString(), restPaused: paused }); }}>{restPaused ? <Play size={15} /> : <Pause size={15} />} {restPaused ? "RETOMAR DESCANSO" : "PAUSAR"}</Button><Button variant="secondary" size="sm" className="rest-action rest-skip-button" disabled={active.isPaused} onClick={skipRest}><SkipForward size={15} /> PULAR DESCANSO</Button></div></Card>
            : <Card className="set-focus"><div className="set-focus-head"><span className="set-focus-count">SÉRIE {String(active.setIndex + 1).padStart(2, "0")}{currentSetDone ? " · CONCLUÍDA" : ""}</span><Pill tone="rose">{set.method.toUpperCase()}</Pill></div><div className="set-target-grid"><div><small>{set.method === "Tempo" || set.method === "Isometria" ? "DURAÇÃO" : "REPETIÇÕES"}</small><strong>{set.method === "Tempo" || set.method === "Isometria" ? `${set.seconds} s` : set.reps}</strong></div><div><small>{previousSet ? "CARGA HOJE" : "CARGA"}</small><strong>{set.weight ? `${set.weight} ${data.settings.weightUnit}` : "Peso corporal"}</strong></div><div><small>DESCANSO</small><strong>{formatTime(exercise.restSeconds)}</strong></div></div>{previousSet && <div className="runner-last-time"><span>ÚLTIMA VEZ</span><strong>{previousWeightLabel}</strong><span>· {previousSet.reps} reps</span></div>}<Button size="lg" className="complete-set-button" disabled={currentSetDone || Boolean(active.isPaused)} onClick={completeCurrentSet}>{currentSetDone ? <CheckCircle2 size={20} /> : <CheckCircle2 size={20} />} {currentSetDone ? "SÉRIE JÁ REGISTRADA" : active.isPaused ? "RETOME PARA CONCLUIR" : "CONCLUIR ESTA SÉRIE"}</Button></Card>}
        <div className="runner-navigation"><button type="button" onClick={() => moveTo(previousSetTarget)} disabled={!previousSetTarget || Boolean(active.isPaused)}><ChevronLeft size={15} /> SÉRIE ANTERIOR</button>{nextSetTarget && <button type="button" onClick={() => moveTo(nextSetTarget)} disabled={Boolean(active.isPaused)}>PRÓXIMA SÉRIE <ChevronRight size={15} /></button>}</div>
        <div className="runner-end-actions"><button type="button" className="finish-early" onClick={finish} disabled={active.isPaused}>Concluir treino agora</button><span><Vibrate size={12} /> Vibração {data.settings.vibration ? "ativada" : "desativada"} · <Volume2 size={12} /> Som {data.settings.sound ? "ativado" : "desativado"}</span></div>
      </main>
    </div>
  </div>;
}
