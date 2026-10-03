import { useMemo } from "react";
import { ArrowDownRight, ArrowRight, ArrowUpRight, CalendarCheck2, ChartNoAxesColumnIncreasing, Check, ChevronLeft, ChevronRight, Clock3, Dumbbell, Flame, Heart, Plus, Sparkles, Trophy } from "lucide-react";
import type { BellaData, PageId, Workout } from "../types";
import { DAYS, makeId } from "../lib/catalog";
import { Card, Button, PageHeading, Pill } from "../components/common";
import { HERO_IMAGE_URL } from "../lib/assetPaths";

function mondayStart(date: Date): Date { const d = new Date(date); d.setHours(0,0,0,0); const shift = (d.getDay() + 6) % 7; d.setDate(d.getDate() - shift); return d; }
function dateKey(date: Date): string { return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`; }
function getWeekDays(): Date[] { const start = mondayStart(new Date()); return DAYS.map((_, i) => { const d = new Date(start); d.setDate(d.getDate()+i); return d; }); }
function streakDays(history: BellaData["history"]): number {
  const dates = new Set(history.map((session) => dateKey(new Date(session.finishedAt))));
  if (!dates.size) return 0;
  let cursor = new Date(); cursor.setHours(0,0,0,0);
  if (!dates.has(dateKey(cursor))) cursor.setDate(cursor.getDate()-1);
  let count = 0;
  while (dates.has(dateKey(cursor))) { count++; cursor.setDate(cursor.getDate()-1); }
  return count;
}
function friendlyDate(date: Date): string { return date.toLocaleDateString("pt-BR", { day: "numeric", month: "long" }); }

export default function Dashboard({ data, onNavigate, onStart, onCreate }: { data: BellaData; onNavigate: (page: PageId) => void; onStart: (workout: Workout) => void; onCreate: () => void }) {
  const week = useMemo(getWeekDays, []);
  const trained = new Set(data.history.filter((session) => new Date(session.finishedAt) >= mondayStart(new Date())).map((session) => dateKey(new Date(session.finishedAt))));
  const todayKey = DAYS[(new Date().getDay()+6)%7].key;
  const todayWorkout = data.workouts.find((workout) => workout.id === data.schedule[todayKey]) ?? data.workouts.find((workout) => workout.days.includes(todayKey)) ?? null;
  const lastWorkout = [...data.history].sort((a,b) => b.finishedAt.localeCompare(a.finishedAt))[0];
  const streak = streakDays(data.history);
  const weeklyCount = data.history.filter((session) => new Date(session.finishedAt) >= mondayStart(new Date())).length;
  const recentExercise = [...data.history].flatMap((session) => session.performed.map((set) => ({ ...set, date: session.finishedAt }))).filter((set) => Number(set.weight) > 0).sort((a,b) => b.date.localeCompare(a.date))[0];
  const greeting = new Date().getHours() < 12 ? "Bom dia" : new Date().getHours() < 18 ? "Boa tarde" : "Boa noite";

  return <div className="page page-home">
    <PageHeading eyebrow={`${greeting.toUpperCase()} · ${friendlyDate(new Date()).toUpperCase()}`} title={<>{greeting}, <em>{data.profile.name.split(" ")[0] || "atleta"}</em>.</>} description="Seu espaço para construir força e acompanhar sua evolução." actions={<div className="heading-mood"><span className="mood-spark"><Sparkles size={18} /></span><span>FOCO NO SEU PROCESSO</span></div>} />
    <div className="dashboard-grid">
      <section className="today-feature" aria-label="Treino recomendado">
        <div className="today-photo" style={{ backgroundImage: `url("${HERO_IMAGE_URL}")` }} />
        <div className="today-overlay" />
        <div className="today-content">
          <div className="today-topline"><span className="today-kicker"><span className="live-dot" /> {todayWorkout ? "ROTINA NA SUA AGENDA" : "UM DIA NO SEU RITMO"}</span>{todayWorkout && <span className="today-chip">{todayWorkout.title}</span>}</div>
          <div><span className="today-tag">{todayWorkout?.description || (data.workouts.length ? "Hoje, você escolhe" : "Seu próximo passo")}</span><h2>{todayWorkout ? <>Força que<br /><em>vem de dentro.</em></> : <>Seu ritmo.<br /><em>Sua escolha.</em></>}</h2><p>{todayWorkout ? `${todayWorkout.exercises.length} exercícios · ${todayWorkout.exercises.reduce((n,e)=>n+e.sets.length,0)} séries` : data.workouts.length ? "Hoje está livre na sua agenda. Abra seus treinos quando quiser se movimentar." : "Crie seu primeiro treino e comece a acompanhar seu progresso."}</p>
          {todayWorkout ? <Button size="lg" onClick={() => onStart(todayWorkout)}>COMEÇAR TREINO <ArrowRight size={16} /></Button> : data.workouts.length ? <Button size="lg" onClick={() => onNavigate("workouts")}><Dumbbell size={16} /> VER MEUS TREINOS</Button> : <Button size="lg" onClick={onCreate}><Plus size={17} /> CRIAR MEU TREINO</Button>}</div>
        </div>
        <div className="today-foot"><span><Heart size={14} fill="currentColor" /> HOJE É UM BOM DIA PARA COMEÇAR</span><span>01 / 03</span></div>
      </section>
      <div className="stats-stack">
        <Card className="streak-card"><div className="stat-card-top"><span className="stat-icon rose"><Flame size={19} /></span><span className="stat-label">SEQUÊNCIA ATUAL</span><span className="stat-tip">NO SEU RITMO</span></div><div className="streak-number">{streak}<span>{streak === 1 ? " dia" : " dias"}</span></div><p>{streak ? "Presença é o seu superpoder." : "Um treino inicia uma boa sequência."}</p><div className="week-streak-dots">{week.map((day,i) => <span key={day.toISOString()} className={`${trained.has(dateKey(day)) ? "done" : ""} ${i === (new Date().getDay()+6)%7 ? "today" : ""}`}>{DAYS[i].short.slice(0,1)}</span>)}</div></Card>
        <Card className="week-card"><div className="week-card-header"><div><div className="eyebrow">CONSISTÊNCIA</div><h3>Minha semana</h3></div><button className="icon-button week-next" onClick={() => onNavigate("calendar")} aria-label="Abrir calendário"><ArrowRight size={16}/></button></div><div className="week-days">{week.map((day,i) => <div className={`week-day ${trained.has(dateKey(day)) ? "trained" : ""} ${dateKey(day) === dateKey(new Date()) ? "is-today" : ""}`} key={day.toISOString()}><span>{DAYS[i].short}</span><b>{day.getDate()}</b><i>{trained.has(dateKey(day)) && <Check size={10}/>}</i></div>)}</div><div className="week-summary"><span><CalendarCheck2 size={14}/> {weeklyCount} {weeklyCount === 1 ? "treino" : "treinos"} nesta semana</span><span className="week-progress"><i style={{ width: `${Math.min(100,(weeklyCount/4)*100)}%` }}/></span></div></Card>
      </div>
    </div>
    <div className="dashboard-lower">
      <div className="section-heading"><div><div className="eyebrow">SEU CAMINHO, NO SEU TEMPO</div><h2>Seu movimento recente</h2></div><button className="text-link" onClick={() => onNavigate("history")}>Ver histórico <ArrowRight size={14}/></button></div>
      <div className="lower-grid">
        <Card className="recent-card">
          {lastWorkout ? <><div className="recent-card-top"><span className="recent-icon"><Dumbbell size={20}/></span><Pill tone="green">CONCLUÍDO</Pill></div><div className="eyebrow">ÚLTIMO TREINO</div><h3>{lastWorkout.title}</h3><p className="recent-description">{lastWorkout.performed.length ? `${new Set(lastWorkout.performed.map((set)=>set.exerciseName)).size} exercícios registrados` : "Seu registro de treino"}</p><div className="recent-meta"><span><Clock3 size={14}/> {Math.max(1,Math.round(lastWorkout.durationSeconds/60))} min</span><span>{new Date(lastWorkout.finishedAt).toLocaleDateString("pt-BR",{day:"numeric",month:"short"})}</span></div></> : <><div className="recent-card-top"><span className="recent-icon"><Dumbbell size={20}/></span><Pill tone="neutral">COMECE QUANDO QUISER</Pill></div><div className="eyebrow">SEU PRIMEIRO CAPÍTULO</div><h3>Uma página em branco.</h3><p className="recent-description">Seu histórico começa quando você conclui um treino.</p><button className="text-link" onClick={() => onNavigate("workouts")}>Ver meus treinos <ArrowRight size={14}/></button></>}
        </Card>
        <Card className="progress-card"><div className="progress-card-head"><span className="progress-card-icon"><ChartNoAxesColumnIncreasing size={19}/></span><span className="eyebrow">SINAL DE EVOLUÇÃO</span></div><h3>{recentExercise ? recentExercise.exerciseName : "Cada sessão conta"}</h3><p>{recentExercise ? `Seu último registro foi ${recentExercise.weight} ${data.settings.weightUnit} · ${recentExercise.reps} reps.` : "Acompanhe cargas, frequência e volume conforme seus treinos avançam."}</p><div className="progress-card-bottom"><span className="progress-arrow"><ArrowUpRight size={17}/></span><button className="text-link" onClick={() => onNavigate("evolution")}>Ver minha evolução <ArrowRight size={14}/></button></div><div className="progress-watermark"><Trophy size={88}/></div></Card>
      <Card className="weekly-insight"><div className="weekly-insight-top"><div><div className="eyebrow">INTENÇÃO &gt; PERFEIÇÃO</div><h3>Seu jeito de evoluir.</h3></div><span className="insight-mark">M</span></div><div className="insight-quote"><span>“</span><p>Consistência não é nunca parar.<br/>É sempre encontrar o caminho de volta.</p></div><div className="insight-footer"><span>UM PASSO DE CADA VEZ</span><span><ArrowDownRight size={15}/></span></div></Card>
      </div>
    </div>
  </div>;
}
