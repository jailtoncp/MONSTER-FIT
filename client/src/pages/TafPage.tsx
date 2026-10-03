import { useEffect, useMemo, useRef, useState } from "react";
import { Activity, CalendarDays, ClipboardCheck, Dumbbell, Footprints, ImagePlus, Info, LoaderCircle, MapPin, Pencil, Plus, Ruler, Timer, TrendingUp, Trophy, X } from "lucide-react";
import { CartesianGrid, Line, LineChart, ReferenceDot, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { BellaData, TafAttempt, TafExerciseOverride, TafUnit } from "../types";
import { Button, Card, Field, Modal, PageHeading, Pill } from "../components/common";
import { createCustomTafExercise, formatTafValue, getTafBest, getTafProgressPoints, TAF_EXERCISES, type TafDemoKind, type TafExercise } from "../lib/tafService";
import { makeId } from "../lib/catalog";
import { TAF_SOURCES } from "../lib/tafSources";
import { TAF_MEDIA } from "../lib/tafMedia";
import { loadExerciseGifs, saveExerciseGif, validateAnimatedExerciseGif } from "../lib/exerciseGifStorage";
import ExerciseEditorModal from "../components/ExerciseEditorModal";

function localDateInputValue() {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
}

function demoImageUrl(demo: TafDemoKind) {
  const asset = TAF_MEDIA[demo];
  return import.meta.env.BASE_URL === "/MONSTER-FIT/" ? `${import.meta.env.BASE_URL}media/taf/${asset.file}` : `/manus-storage/${asset.storageFile}`;
}

function demoPosterUrl(demo: TafDemoKind) {
  const asset = TAF_MEDIA[demo];
  return import.meta.env.BASE_URL === "/MONSTER-FIT/" ? `${import.meta.env.BASE_URL}media/taf/${asset.posterFile}` : `/manus-storage/${asset.posterStorageFile}`;
}

function dateLabel(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Data não disponível" : date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

function TafSchematic({ demo }: { demo: TafDemoKind }) {
  const dark = "#765368";
  const rose = "#c85f89";
  const light = "#e6b4c8";
  const ground = "#d3b8c5";
  return <svg className={`taf-schematic taf-schematic-${demo}`} viewBox="0 0 320 150" aria-hidden="true" focusable="false">
    <path d="M24 128H296" stroke={ground} strokeWidth="2" strokeLinecap="round"/>
    {demo === "rower" && <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      <g stroke={light} strokeWidth="6" strokeDasharray="5 5" opacity=".8"><path d="M45 116h63l30-7"/><circle cx="36" cy="111" r="7" fill="#fbf2f6"/><path d="M101 115l28-5 31 5m-26-6 24 6"/></g>
      <path d="M48 108h50l11 9" stroke={ground} strokeWidth="3"/><path d="M94 116h55" stroke={dark} strokeWidth="7"/><circle cx="154" cy="113" r="8" fill="#fff8fb" stroke={rose} strokeWidth="4"/><path d="M146 111l13-16 17-11" stroke={rose} strokeWidth="8"/><circle cx="181" cy="80" r="7" fill="#fff8fb" stroke={dark} strokeWidth="4"/><path d="M166 98l21-12 18 8m-25-23 13 11 12 8" stroke={dark} strokeWidth="6"/><path d="M177 83l27 18m-27-18 33 10" stroke={rose} strokeWidth="5"/>
      <path d="M71 83c23-29 54-35 77-30" stroke={rose} strokeWidth="3"/><path d="m140 45 10 8-11 6" stroke={rose} strokeWidth="3"/>
    </g>}
    {demo === "sprint" && <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M50 112h220M66 121h198" stroke={ground} strokeWidth="2"/><path d="M54 103h28m-16 9h31" stroke={light} strokeWidth="5"/>
      <circle cx="164" cy="40" r="10" fill="#fff8fb" stroke={dark} strokeWidth="4"/><path d="m157 52-17 27 26 12 14-27" fill={rose} stroke={dark} strokeWidth="5"/><path d="m151 61-25 6-19-11m26 12 22-10 19 4" stroke={dark} strokeWidth="6"/><path d="m143 79-30 12-23-5m50 4 22 18 24 4" stroke={dark} strokeWidth="7"/><path d="m84 38 36 0m-47 14h26m-40 14h30" stroke={light} strokeWidth="4"/><path d="M190 50h42m-10-9 11 9-11 9" stroke={rose} strokeWidth="3"/>
    </g>}
    {demo === "static-bar" && <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M90 35h140" stroke={dark} strokeWidth="7"/><path d="M105 35v13m110-13v13" stroke={ground} strokeWidth="5"/>
      <circle cx="161" cy="62" r="9" fill="#fff8fb" stroke={dark} strokeWidth="4"/><path d="M161 72v34" stroke={rose} strokeWidth="10"/><path d="M157 75 137 44l-6-5m34 36 19-31 6-5" stroke={dark} strokeWidth="6"/><path d="m157 106-15 20m23-20 15 20" stroke={dark} strokeWidth="7"/><path d="M111 83v27m-9-9 9 10 9-10" stroke={rose} strokeWidth="3"/><circle cx="161" cy="62" r="19" stroke={light} strokeWidth="2" strokeDasharray="4 5"/>
    </g>}
    {demo === "jump" && <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M38 128v-10m12 10v-16m12 16v-21m12 21v-17m12 17v-23m12 23v-15" stroke={ground} strokeWidth="2"/><path d="M229 128v-13m12 13v-20m12 20v-14m12 14v-23m12 23v-18" stroke={ground} strokeWidth="2"/>
      <circle cx="172" cy="45" r="9" fill="#fff8fb" stroke={dark} strokeWidth="4"/><path d="m168 56-13 27 24 12 16-23" fill={rose} stroke={dark} strokeWidth="5"/><path d="m165 63-22-14-17 1m27 2 23-17 13 3" stroke={dark} strokeWidth="6"/><path d="m177 94-28 14-20-5m50 0 29 7 19-5" stroke={dark} strokeWidth="7"/>
      <path d="M85 100c33-56 72-73 116-63" stroke={rose} strokeWidth="3" strokeDasharray="6 6"/><path d="m192 29 11 8-13 5" stroke={rose} strokeWidth="3"/><path d="M115 125h116" stroke={rose} strokeWidth="3"/><path d="m115 120 0 10m116-10v10" stroke={rose} strokeWidth="3"/>
    </g>}
    {demo === "rope" && <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M210 13v118" stroke="#ad8d70" strokeWidth="5"/><path d="M210 13v118" stroke="#e1cdb6" strokeWidth="2" strokeDasharray="3 7"/>
      <circle cx="166" cy="42" r="9" fill="#fff8fb" stroke={dark} strokeWidth="4"/><path d="m167 53 9 32-12 22" stroke={rose} strokeWidth="9"/><path d="m170 59 23-20 17 5m-34 4 12-27 20 1" stroke={dark} strokeWidth="6"/><path d="m164 106-20 19-7-7m16-11 14 19 16-4" stroke={dark} strokeWidth="7"/><path d="M237 93c20-18 20-39 4-52" stroke={rose} strokeWidth="3"/><path d="m239 36 2 12-12-3" stroke={rose} strokeWidth="3"/>
    </g>}
    {demo === "shuttle" && <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M48 114h224M48 119h224" stroke={ground} strokeWidth="2"/><path d="M69 113 82 89l13 24zM226 113l13-24 13 24z" fill="#edd8e1" stroke={rose} strokeWidth="3"/>
      <circle cx="178" cy="50" r="8" fill="#fff8fb" stroke={dark} strokeWidth="4"/><path d="m174 59-18 24 22 10 15-22" fill={rose} stroke={dark} strokeWidth="5"/><path d="m166 67-24-8-18 5m29 0 24-12 15 0" stroke={dark} strokeWidth="6"/><path d="m178 91-27 9-21-7m47 7 26 8 19-6" stroke={dark} strokeWidth="7"/><path d="M206 35c36 1 53 25 38 49" stroke={rose} strokeWidth="3"/><path d="m236 80 8 8 6-11" stroke={rose} strokeWidth="3"/><path d="M117 51H78" stroke={light} strokeWidth="4"/><path d="m86 44-9 7 9 7" stroke={light} strokeWidth="4"/>
    </g>}
    {demo === "push-up" && <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M59 119h202" stroke={ground} strokeWidth="2"/><circle cx="219" cy="79" r="8" fill="#fff8fb" stroke={dark} strokeWidth="4"/><path d="m211 86-35 14-57 7-38 0" stroke={rose} strokeWidth="9"/><path d="m176 100-9 23m9-23 19 23m-93-16-14 12m0-12-8 12" stroke={dark} strokeWidth="6"/><path d="M197 67v-27m-8 8 8-9 8 9" stroke={light} strokeWidth="3"/><path d="M73 92c34-19 76-21 106-9" stroke={rose} strokeWidth="3" strokeDasharray="5 6"/>
    </g>}
  </svg>;
}

function DemoArt({ exercise, overrideUrl, onEdit, uploading }: { exercise: TafExercise; overrideUrl?: string; onEdit?: () => void; uploading?: boolean }) {
  const media = TAF_MEDIA[exercise.demo];
  const src = overrideUrl || demoImageUrl(exercise.demo);
  if (src) return <div className="taf-demo"><picture>{!overrideUrl && <source media="(prefers-reduced-motion: reduce)" srcSet={demoPosterUrl(exercise.demo)} type="image/webp"/>}<img src={src} alt={`${overrideUrl ? "GIF personalizado" : media.kind === "generated-human" ? "Animação humana gerada por IA" : media.kind === "original" ? "Animação esquemática" : "Demonstração animada"} de ${exercise.name}`} loading="lazy"/></picture><span className="taf-demo-tag"><Activity size={12}/> {overrideUrl ? "GIF PERSONALIZADO" : media.kind === "generated-human" ? "ANIMAÇÃO HUMANA · IA" : media.kind === "original" ? "GIF ESQUEMÁTICO" : "DEMONSTRAÇÃO ANIMADA"}</span>{media.source && !overrideUrl && <a className="taf-demo-credit" href={media.source} target="_blank" rel="noreferrer">{media.credit}</a>}{onEdit && <button type="button" className="taf-gif-picker" aria-label={`${overrideUrl ? "Trocar" : "Adicionar"} GIF de ${exercise.name}`} title={`${uploading ? "Salvando" : "Editar GIF"} de ${exercise.name}`} disabled={uploading} onClick={onEdit}>{uploading ? <LoaderCircle size={14}/> : <Pencil size={14}/>}</button>}</div>;
  return <div className={`taf-demo taf-demo-vector taf-demo-${exercise.demo}`} role="img" aria-label={`Ilustração esquemática de ${exercise.name}`}>
    <span className="taf-demo-tag"><Activity size={12}/> ILUSTRAÇÃO ESQUEMÁTICA</span>
    <TafSchematic demo={exercise.demo}/>
    <span className="taf-demo-caption">Movimento representativo · consulte o protocolo do edital</span>
    {onEdit && <button type="button" className="taf-gif-picker" aria-label={`Adicionar GIF de ${exercise.name}`} title={`${uploading ? "Salvando" : "Adicionar GIF"} de ${exercise.name}`} disabled={uploading} onClick={onEdit}>{uploading ? <LoaderCircle size={14}/> : <Pencil size={14}/>}</button>}
  </div>;
}

export default function TafPage({ data, accountId, onSave, onCreate, onSaveExercise, onDeleteExercise }: { data: BellaData; accountId: string; onSave: (attempt: TafAttempt) => void; onCreate: (exercise: BellaData["customTafExercises"][number]) => void; onSaveExercise: (id: string, override: TafExerciseOverride) => void; onDeleteExercise: (id: string) => void }) {
  const [category, setCategory] = useState("Todas");
  const [chartExerciseId, setChartExerciseId] = useState(TAF_EXERCISES[0].id);
  const [activeExercise, setActiveExercise] = useState<TafExercise | null>(null);
  const [editingExercise, setEditingExercise] = useState<TafExercise | null>(null);
  const [recording, setRecording] = useState(false);
  const [value, setValue] = useState("");
  const [measuredAt, setMeasuredAt] = useState(localDateInputValue);
  const [exam, setExam] = useState("");
  const [notes, setNotes] = useState("");
  const [formError, setFormError] = useState("");
  const [gifUrls, setGifUrls] = useState<Record<string, string>>({});
  const [gifUploading, setGifUploading] = useState<string | null>(null);
  const [gifError, setGifError] = useState("");
  const [customOpen, setCustomOpen] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customDescription, setCustomDescription] = useState("");
  const [customUnit, setCustomUnit] = useState<TafUnit>("reps");
  const [customDirection, setCustomDirection] = useState<"higher" | "lower">("higher");
  const [customGif, setCustomGif] = useState<File | null>(null);
  const [customError, setCustomError] = useState("");
  const [savingCustom, setSavingCustom] = useState(false);
  const gifInputs = useRef<Record<string, HTMLInputElement | null>>({});
  const customGifInput = useRef<HTMLInputElement | null>(null);
  const objectUrls = useRef(new Set<string>());
  function clearCustomGif() { setCustomGif(null); if (customGifInput.current) customGifInput.current.value = ""; }
  const attempts = data.tafAttempts ?? [];
  const tafExercises = useMemo<TafExercise[]>(() => [
    ...TAF_EXERCISES.filter((exercise) => !data.hiddenExerciseIds.includes(exercise.id)).map((exercise) => ({ ...exercise, ...(data.tafExerciseOverrides[exercise.id] ?? {}) })),
    ...data.customTafExercises.filter((exercise) => !data.hiddenExerciseIds.includes(exercise.id)),
  ], [data.customTafExercises, data.hiddenExerciseIds, data.tafExerciseOverrides]);
  const chartExercise = tafExercises.find((exercise) => exercise.id === chartExerciseId) ?? tafExercises[0] ?? TAF_EXERCISES[0];
  const chartPoints = useMemo(() => getTafProgressPoints(attempts, chartExercise), [attempts, chartExercise]);
  const chartBest = getTafBest(attempts, chartExercise);
  const firstChartPoint = chartPoints[0];
  const lastChartPoint = chartPoints[chartPoints.length - 1];
  const changeFromFirst = firstChartPoint && lastChartPoint ? lastChartPoint.value - firstChartPoint.value : 0;
  const improvement = chartExercise.higherIsBetter ? changeFromFirst : -changeFromFirst;
  const chartMin = chartPoints.length ? Math.min(...chartPoints.map((point) => point.value)) : 0;
  const chartMax = chartPoints.length ? Math.max(...chartPoints.map((point) => point.value)) : 0;
  const chartPadding = chartPoints.length ? Math.max((chartMax - chartMin) * 0.16, Math.abs(chartMax || chartMin) * 0.06, chartExercise.defaultUnit === "reps" ? 1 : 0.1) : 1;
  const chartDomain: [number, number] = [Math.max(0, chartMin - chartPadding), chartMax + chartPadding];
  const categories = useMemo(() => ["Todas", ...Array.from(new Set(tafExercises.map((exercise) => exercise.category)))], [tafExercises]);
  const visibleExercises = category === "Todas" ? tafExercises : tafExercises.filter((exercise) => exercise.category === category);
  const recordedExercises = new Set(attempts.map((attempt) => attempt.exerciseId));
  const latest = attempts[0];
  const attemptExercise = tafExercises.find((exercise) => exercise.id === latest?.exerciseId);
  const recentAttempts = attempts.slice(0, 8);

  useEffect(() => {
    let cancelled = false;
    setGifUrls({});
    setGifError("");
    void loadExerciseGifs(accountId).then((saved) => {
      if (cancelled) return;
      const urls = Object.fromEntries(Object.entries(saved).map(([id, blob]) => {
        const url = URL.createObjectURL(blob);
        objectUrls.current.add(url);
        return [id, url];
      }));
      setGifUrls(urls);
    }).catch((error: unknown) => {
      if (!cancelled) setGifError(error instanceof Error ? error.message : "Não foi possível carregar seus GIFs locais.");
    });
    return () => {
      cancelled = true;
      for (const url of objectUrls.current) URL.revokeObjectURL(url);
      objectUrls.current.clear();
    };
  }, [accountId]);

  async function uploadGif(exercise: TafExercise, file?: File) {
    if (!file) return;
    setGifUploading(exercise.id);
    setGifError("");
    try {
      await validateAnimatedExerciseGif(file);
      await saveExerciseGif(accountId, exercise.id, file);
      const nextUrl = URL.createObjectURL(file);
      objectUrls.current.add(nextUrl);
      setGifUrls((current) => {
        const previous = current[exercise.id];
        if (previous) { URL.revokeObjectURL(previous); objectUrls.current.delete(previous); }
        return { ...current, [exercise.id]: nextUrl };
      });
    } catch (error) {
      setGifError(error instanceof Error ? error.message : "Não foi possível salvar esse GIF.");
    } finally {
      setGifUploading(null);
      const input = gifInputs.current[exercise.id];
      if (input) input.value = "";
    }
  }

  async function createManualTafExercise(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCustomError("");
    if (!customName.trim()) { setCustomError("Digite um nome para a modalidade."); return; }
    if (!customDescription.trim()) { setCustomError("Descreva como essa modalidade é realizada."); return; }
    if (!customGif) { setCustomError("Escolha um GIF demonstrativo para a modalidade."); return; }
    const exercise = createCustomTafExercise(makeId("custom-taf"), customName, customDescription, customUnit, customDirection === "higher");
    setSavingCustom(true);
    try {
      await validateAnimatedExerciseGif(customGif);
      await saveExerciseGif(accountId, exercise.id, customGif);
      const url = URL.createObjectURL(customGif);
      objectUrls.current.add(url);
      setGifUrls((current) => ({ ...current, [exercise.id]: url }));
      onCreate(exercise);
      setChartExerciseId(exercise.id);
      setCustomOpen(false);
      setCustomName(""); setCustomDescription(""); setCustomUnit("reps"); setCustomDirection("higher"); clearCustomGif();
    } catch (error) {
      setCustomError(error instanceof Error ? error.message : "Não foi possível salvar o GIF neste dispositivo.");
    } finally {
      setSavingCustom(false);
    }
  }

  function openExercise(exercise: TafExercise) {
    setActiveExercise(exercise); setRecording(false); setValue(""); setMeasuredAt(localDateInputValue()); setExam(""); setNotes(""); setFormError("");
  }

  function saveAttempt(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!activeExercise) return;
    const numericValue = Number(value.replace(",", "."));
    if (!Number.isFinite(numericValue) || numericValue <= 0) { setFormError("Informe um resultado maior que zero."); return; }
    if (!measuredAt || Number.isNaN(new Date(`${measuredAt}T12:00:00`).getTime())) { setFormError("Informe a data da tentativa."); return; }
    const id = globalThis.crypto?.randomUUID?.() ?? `taf-${Date.now().toString(36)}`;
    onSave({ id, exerciseId: activeExercise.id, value: numericValue, unit: activeExercise.defaultUnit, measuredAt: new Date(`${measuredAt}T12:00:00`).toISOString(), exam: exam.trim() || undefined, notes: notes.trim() || undefined });
    setActiveExercise(null); setRecording(false);
  }

  return <div className="page taf-page">
    <PageHeading eyebrow="TREINO DE APTIDÃO FÍSICA" title={<>Preparação para o <em>TAF</em></>} description="Acompanhe suas marcas nas provas físicas presentes em concursos policiais. Cada edital define o próprio protocolo." actions={<Pill tone="rose"><ClipboardCheck size={13}/> ÁREA EXCLUSIVA TAF</Pill>}/>
    <div className="taf-notice" role="note"><Info size={18}/><p><strong>Sem índices universais.</strong> As modalidades, a execução e os critérios mudam entre concursos. Use a área para registrar seus próprios resultados e confirme cada regra no edital vigente.</p></div>
    <div className="taf-stats" aria-label="Resumo do acompanhamento TAF"><Card className="taf-stat"><span className="taf-stat-icon"><ClipboardCheck size={18}/></span><span className="eyebrow">TENTATIVAS REGISTRADAS</span><strong>{attempts.length}</strong><small>no seu perfil local</small></Card><Card className="taf-stat"><span className="taf-stat-icon"><Activity size={18}/></span><span className="eyebrow">MODALIDADES ACOMPANHADAS</span><strong>{recordedExercises.size}<small>/{tafExercises.length}</small></strong><small>com ao menos uma marca</small></Card><Card className="taf-stat taf-stat-last"><span className="taf-stat-icon"><CalendarDays size={18}/></span><span className="eyebrow">ÚLTIMA TENTATIVA</span><strong className="taf-stat-date">{latest ? dateLabel(latest.measuredAt) : "—"}</strong><small>{attemptExercise?.name ?? "Registre sua primeira marca"}</small></Card></div>
    <section className="taf-progress" aria-labelledby="taf-progress-title">
      <div className="taf-progress-heading">
        <div><span className="eyebrow">SEU HISTÓRICO EM FOCO</span><h2 id="taf-progress-title"><TrendingUp size={22}/> Evolução das marcas</h2><p>Acompanhe cada resultado registrado, modalidade por modalidade.</p></div>
        <Field label="ESCOLHA A MODALIDADE"><select value={chartExerciseId} onChange={(event) => setChartExerciseId(event.target.value)}>{tafExercises.map((exercise) => <option key={exercise.id} value={exercise.id}>{exercise.name}</option>)}</select></Field>
      </div>
      <div className="taf-progress-summary" aria-live="polite">
        <Card className="taf-progress-stat"><span className="eyebrow">MARCAS NO GRÁFICO</span><strong>{chartPoints.length}</strong><small>tentativas válidas</small></Card>
        <Card className="taf-progress-stat"><span className="eyebrow">MELHOR MARCA</span><strong>{chartBest === null ? "—" : formatTafValue(chartBest, chartExercise.defaultUnit)}</strong><small>{chartExercise.higherIsBetter ? "maior resultado" : "menor tempo"}</small></Card>
        <Card className="taf-progress-stat"><span className="eyebrow">DESDE A PRIMEIRA</span><strong className={chartPoints.length > 1 ? (improvement > 0 ? "is-improved" : improvement < 0 ? "is-lower" : "") : ""}>{chartPoints.length > 1 ? improvement !== 0 ? `${changeFromFirst > 0 ? "+" : "−"}${formatTafValue(Math.abs(changeFromFirst), chartExercise.defaultUnit)}` : "Sem variação" : "—"}</strong><small>{chartPoints.length > 1 ? improvement > 0 ? "melhor que a primeira" : improvement < 0 ? "resultado menos favorável" : "mesmo valor da primeira" : "registre mais uma marca"}</small></Card>
      </div>
      {chartPoints.length ? <div className="taf-progress-chart" role="img" aria-label={`Gráfico da evolução de ${chartExercise.name} com ${chartPoints.length} marcas registradas`}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartPoints} margin={{ top: 14, right: 16, bottom: 5, left: 2 }}>
            <CartesianGrid stroke="var(--line)" strokeDasharray="3 5" vertical={false}/>
            <XAxis dataKey="dateLabel" tick={{ fill: "var(--muted)", fontSize: 10 }} tickLine={false} axisLine={{ stroke: "var(--line)" }} minTickGap={18} interval="preserveStartEnd"/>
            <YAxis domain={chartDomain} width={48} tick={{ fill: "var(--muted)", fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={(value: number) => chartExercise.defaultUnit === "s" ? Number(value).toLocaleString("pt-BR", { maximumFractionDigits: 2 }) : Number(value).toLocaleString("pt-BR", { maximumFractionDigits: chartExercise.defaultUnit === "reps" ? 0 : 1 })}/>
            <Tooltip cursor={{ stroke: "var(--rose)", strokeDasharray: "3 4", strokeOpacity: 0.35 }} content={({ active, payload }) => active && payload?.length ? <div className="taf-chart-tooltip"><strong>{payload[0].payload.fullDateLabel}</strong>{payload[0].payload.exam && <span>{payload[0].payload.exam}</span>}<b>{formatTafValue(Number(payload[0].value), chartExercise.defaultUnit)}</b></div> : null}/>
            <Line type="monotone" dataKey="value" name="Marca" stroke="var(--rose)" strokeWidth={3} dot={{ r: 4, fill: "var(--rose)", stroke: "var(--card)", strokeWidth: 2 }} activeDot={{ r: 6, stroke: "var(--card)", strokeWidth: 2 }} isAnimationActive={false}/>
            {chartBest !== null && chartPoints.filter((point) => point.value === chartBest).slice(-1).map((point) => <ReferenceDot key={point.id} x={point.dateLabel} y={point.value} r={7} fill="var(--rose-deep)" stroke="var(--card)" strokeWidth={3} isFront/>) }
          </LineChart>
        </ResponsiveContainer>
      </div> : <div className="taf-progress-empty"><span><TrendingUp size={21}/></span><div><strong>Seu gráfico começa com a primeira marca.</strong><p>Registre um resultado na modalidade selecionada para visualizar sua evolução ao longo do tempo.</p></div></div>}
      {chartPoints.length > 0 && <p className="taf-progress-note"><Info size={13}/>{chartExercise.higherIsBetter ? "Valores maiores indicam marcas mais altas nesta modalidade." : "Nesta prova de tempo, a linha descendo representa uma marca melhor."}{chartPoints.length === 1 && " Registre outra tentativa para comparar seu progresso."}</p>}
    </section>
    <section className="taf-library" aria-labelledby="taf-library-title"><div className="taf-section-heading"><div><span className="eyebrow">PROVAS E EXERCÍCIOS</span><h2 id="taf-library-title">Biblioteca TAF</h2></div><div className="taf-section-actions"><Button variant="secondary" onClick={() => { setCustomError(""); setCustomOpen(true); }}><Plus size={15}/> ADICIONAR EXERCÍCIO</Button><Field label="FILTRAR MODALIDADE"><select value={category} onChange={(event) => setCategory(event.target.value)}>{categories.map((item) => <option key={item}>{item}</option>)}</select></Field></div></div>{gifError && <div className="exercise-gif-storage-error" role="alert">{gifError}</div>}
      <div className="taf-exercise-grid">{visibleExercises.map((exercise) => {
        const personalBest = getTafBest(attempts, exercise);
        const last = attempts.find((attempt) => attempt.exerciseId === exercise.id);
        return <Card className="taf-exercise-card" key={exercise.id}>
          <DemoArt exercise={exercise} overrideUrl={gifUrls[exercise.id]} uploading={gifUploading === exercise.id} onEdit={() => setEditingExercise(exercise)}/>
          <input ref={(element) => { gifInputs.current[exercise.id] = element; }} type="file" accept="image/gif,.gif" aria-label={`Escolher GIF animado para ${exercise.name}`} className="exercise-gif-input" onChange={(event) => void uploadGif(exercise, event.currentTarget.files?.[0])}/>
          <div className="taf-card-copy"><Pill tone="neutral">{exercise.category.toUpperCase()}</Pill><h3>{exercise.name}</h3><p>{exercise.purpose}</p><div className="taf-card-muscles"><Dumbbell size={14}/><span>{exercise.muscles}</span></div></div>
          <div className="taf-card-marks"><div><span className="eyebrow"><Trophy size={12}/> MELHOR MARCA</span><strong>{personalBest === null ? "—" : formatTafValue(personalBest, exercise.defaultUnit)}</strong></div>{last && <div className="taf-last-mark"><span>Última · {dateLabel(last.measuredAt)}</span><b>{formatTafValue(last.value, last.unit)}</b></div>}</div>
          <div className="taf-card-footer"><span className="taf-metric-note"><Ruler size={13}/>{exercise.metricLabel}</span><Button onClick={() => openExercise(exercise)}><Plus size={15}/> REGISTRAR MARCA</Button></div>
          <details className="taf-sources"><summary>Ver referências e variações de edital</summary><div>{(TAF_SOURCES[exercise.id] ?? []).map((source) => <a key={source.url} href={source.url} target="_blank" rel="noreferrer"><strong>{source.label}</strong><span>{source.context}</span></a>)}</div></details>
        </Card>;
      })}</div>
    </section>
    <section className="taf-history" aria-labelledby="taf-history-title"><div className="taf-section-heading"><div><span className="eyebrow">HISTÓRICO PESSOAL</span><h2 id="taf-history-title">Suas últimas marcas</h2></div>{attempts.length > 8 && <span className="taf-total-note">{attempts.length} tentativas no total</span>}</div>
      {recentAttempts.length ? <div className="taf-history-list">{recentAttempts.map((attempt) => {
        const exercise = tafExercises.find((item) => item.id === attempt.exerciseId);
        if (!exercise) return null;
        return <Card className="taf-history-row" key={attempt.id}><div className="taf-history-icon"><Activity size={16}/></div><div className="taf-history-copy"><strong>{exercise.name}</strong><span><CalendarDays size={12}/>{dateLabel(attempt.measuredAt)}{attempt.exam && <> · <MapPin size={12}/>{attempt.exam}</>}</span>{attempt.notes && <small>{attempt.notes}</small>}</div><strong className="taf-history-value">{formatTafValue(attempt.value, attempt.unit)}</strong></Card>;
      })}</div> : <Card className="taf-history-empty"><span><Footprints size={22}/></span><div><strong>Suas marcas começam aqui.</strong><p>Escolha uma modalidade acima para registrar uma tentativa. O acompanhamento é pessoal e separado dos treinos de musculação.</p></div></Card>}
    </section>
    <p className="taf-disclaimer"><Info size={14}/> Ferramenta de registro pessoal. Não calcula aptidão, nota ou aprovação. Consulte o edital e a equipe aplicadora do concurso para as regras oficiais.</p>
    <Modal open={!!activeExercise} title={activeExercise?.name ?? "Modalidade TAF"} eyebrow="DETALHES E ACOMPANHAMENTO" onClose={() => setActiveExercise(null)} wide>
      {activeExercise && <div className="taf-modal-content"><DemoArt exercise={activeExercise}/>{!recording ? <><div className="taf-modal-detail"><span className="eyebrow">FINALIDADE</span><p>{activeExercise.purpose}</p><span className="eyebrow">FOCO MUSCULAR / FÍSICO</span><p>{activeExercise.muscles}</p></div><div className="taf-modal-cue"><Info size={15}/><p>{activeExercise.cue} Referências abaixo são exemplos de editais específicos e não estabelecem regra geral.</p></div><div className="taf-modal-sources"><span className="eyebrow">REFERÊNCIAS OFICIAIS CONSULTADAS</span>{(TAF_SOURCES[activeExercise.id] ?? []).map((source) => <a key={source.url} href={source.url} target="_blank" rel="noreferrer">{source.label} ↗</a>)}</div><div className="modal-actions"><Button variant="outline" onClick={() => setActiveExercise(null)}><X size={15}/> FECHAR</Button><Button onClick={() => setRecording(true)}><Plus size={15}/> REGISTRAR TENTATIVA</Button></div></> : <form className="taf-record-form" onSubmit={saveAttempt}>
        <div className="taf-form-intro"><Timer size={18}/><p>Registre sua marca pessoal. A unidade acompanha esta modalidade; critérios de aprovação dependem do edital.</p></div>
        <div className="taf-record-grid"><Field label={activeExercise.metricLabel.toUpperCase()}><span className="taf-value-input"><input aria-label={activeExercise.metricLabel} type="number" min={activeExercise.defaultUnit === "reps" ? "1" : "0.01"} step={activeExercise.defaultUnit === "reps" ? "1" : "any"} inputMode="decimal" value={value} onChange={(event) => setValue(event.target.value)} required placeholder={activeExercise.defaultUnit === "reps" ? "Ex.: 30" : "Ex.: 12,5"}/><span>{activeExercise.unitLabel}</span></span></Field><Field label="DATA DA TENTATIVA"><input type="date" value={measuredAt} onChange={(event) => setMeasuredAt(event.target.value)} required/></Field></div>
        <Field label="CONCURSO OU EDITAL (OPCIONAL)"><input value={exam} onChange={(event) => setExam(event.target.value)} maxLength={80} placeholder="Ex.: concurso/corporação"/></Field>
        <Field label="OBSERVAÇÕES (OPCIONAL)"><textarea value={notes} onChange={(event) => setNotes(event.target.value)} maxLength={240} rows={3} placeholder="Percurso, protocolo usado ou contexto da tentativa"/></Field>
        {formError && <div role="alert" className="form-message error-message">{formError}</div>}
        <div className="modal-actions"><Button type="button" variant="outline" onClick={() => setRecording(false)}>VOLTAR</Button><Button type="submit"><ClipboardCheck size={15}/> SALVAR MARCA</Button></div>
      </form>}</div>}
    </Modal>
    <ExerciseEditorModal exercise={editingExercise} gifUrl={editingExercise ? gifUrls[editingExercise.id] : undefined} gifUploading={editingExercise ? gifUploading === editingExercise.id : false} onClose={() => setEditingExercise(null)} onGifChange={(file) => editingExercise && void uploadGif(editingExercise, file)} onSave={(value) => { if (editingExercise && "metricLabel" in value) { onSaveExercise(editingExercise.id, value as TafExerciseOverride); setEditingExercise(null); } }} onDelete={() => { if (editingExercise) { onDeleteExercise(editingExercise.id); setEditingExercise(null); } }} />
    <Modal open={customOpen} title="Adicionar exercício ao TAF" eyebrow="MODALIDADE PERSONALIZADA" onClose={() => { if (!savingCustom) { setCustomOpen(false); setCustomError(""); clearCustomGif(); } }}><form className="custom-exercise-form custom-taf-form" onSubmit={(event) => void createManualTafExercise(event)}><Field label="Nome do exercício"><input value={customName} onChange={(event) => setCustomName(event.target.value)} required maxLength={60} placeholder="Ex.: Corrida de 2.400 m"/></Field><Field label="Descrição"><textarea value={customDescription} onChange={(event) => setCustomDescription(event.target.value)} required maxLength={240} rows={3} placeholder="Descreva como você realiza esta modalidade"/></Field><div className="custom-two-cols"><Field label="Unidade da marca"><select value={customUnit} onChange={(event) => setCustomUnit(event.target.value as TafUnit)}><option value="reps">Repetições (reps)</option><option value="m">Metros (m)</option><option value="cm">Centímetros (cm)</option><option value="s">Segundos (s)</option></select></Field><Field label="Qual resultado é melhor?"><select value={customDirection} onChange={(event) => setCustomDirection(event.target.value as "higher" | "lower")}><option value="higher">Maior</option><option value="lower">Menor</option></select></Field></div><Field label="GIF animado"><input ref={customGifInput} type="file" accept="image/gif,.gif" aria-label="GIF da modalidade TAF" onChange={(event) => { setCustomGif(event.currentTarget.files?.[0] ?? null); setCustomError(""); }} required/><small>{customGif ? customGif.name : "GIF obrigatório, até 12 MB."}</small></Field>{customError && <div className="form-message error-message" role="alert">{customError}</div>}<div className="modal-actions"><Button type="button" variant="outline" disabled={savingCustom} onClick={() => { setCustomOpen(false); clearCustomGif(); setCustomError(""); }}>CANCELAR</Button><Button type="submit" disabled={savingCustom}>{savingCustom ? <LoaderCircle size={15}/> : <ImagePlus size={15}/>} {savingCustom ? "SALVANDO…" : "ADICIONAR EXERCÍCIO"}</Button></div></form></Modal>
  </div>;
}
