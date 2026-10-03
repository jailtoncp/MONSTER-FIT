import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Activity, Dumbbell, Filter, Heart, ImagePlus, LoaderCircle, Pencil, Plus, Search, Sparkles, X } from "lucide-react";
import type { BellaData, ExerciseDefinition, Workout } from "../types";
import { EXERCISE_CATALOG, makeId } from "../lib/catalog";
import { EXERCISE_MEDIA_CREDITS } from "../lib/exerciseMediaCredits";
import { loadExerciseGifs, saveExerciseGif, validateAnimatedExerciseGif } from "../lib/exerciseGifStorage";
import { Button, Card, EmptyState, Field, Modal, PageHeading, Pill } from "../components/common";
import ExerciseEditorModal from "../components/ExerciseEditorModal";

const libraryGroup = (exercise: Pick<ExerciseDefinition, "muscle">) => exercise.muscle === "Condicionamento" ? "Cardio" : exercise.muscle;
const muscles = ["Todos", ...Array.from(new Set(EXERCISE_CATALOG.map((exercise) => libraryGroup(exercise))))];
const equipment = ["Todos", ...Array.from(new Set(EXERCISE_CATALOG.map((exercise) => exercise.equipment)))];

export function ExerciseBrowser({ data, selectedWorkout, onAdd, onFavorite, showHeader = true, topContent, accountId, onSaveExercise, onDeleteExercise }: { data: BellaData; selectedWorkout?: Workout; onAdd?: (exercise: ExerciseDefinition) => void; onFavorite: (id: string) => void; showHeader?: boolean; topContent?: ReactNode; accountId?: string; onSaveExercise?: (exercise: ExerciseDefinition) => void; onDeleteExercise?: (exercise: ExerciseDefinition) => void }) {
  const [query,setQuery] = useState("");
  const [muscle,setMuscle] = useState("Todos");
  const [equip,setEquip] = useState("Todos");
  const [onlyFavorites,setOnlyFavorites] = useState(false);
  const [selected,setSelected] = useState<ExerciseDefinition | null>(null);
  const [editingExercise, setEditingExercise] = useState<ExerciseDefinition | null>(null);
  const [customOpen,setCustomOpen] = useState(false);
  const [customName,setCustomName] = useState("");
  const [customMuscle,setCustomMuscle] = useState("Glúteos");
  const [customEquipment,setCustomEquipment] = useState("Máquina");
  const [customReps,setCustomReps] = useState("12");
  const [customSets,setCustomSets] = useState("4");
  const [customRest,setCustomRest] = useState("90");
  const [customPurpose,setCustomPurpose] = useState("");
  const [customPrimaryMuscles,setCustomPrimaryMuscles] = useState("");
  const [customSecondaryMuscles,setCustomSecondaryMuscles] = useState("");
  const [customDesc,setCustomDesc] = useState("");
  const [customGif,setCustomGif] = useState<File|null>(null);
  const [customError,setCustomError] = useState("");
  const [customSaving,setCustomSaving] = useState(false);
  const [gifUrls,setGifUrls] = useState<Record<string,string>>({});
  const [gifFeedbacks,setGifFeedbacks] = useState<Record<string,{kind:"success"|"error";text:string}>>({});
  const [gifStorageError,setGifStorageError] = useState("");
  const [gifUploading,setGifUploading] = useState<string|null>(null);
  const gifInputs = useRef<Record<string,HTMLInputElement|null>>({});
  const customGifInput = useRef<HTMLInputElement|null>(null);
  const objectUrls = useRef(new Set<string>());
  function clearCustomGif() { setCustomGif(null); if (customGifInput.current) customGifInput.current.value = ""; }
  const all = useMemo(() => [...EXERCISE_CATALOG, ...data.customExercises].filter((exercise) => !data.hiddenExerciseIds.includes(exercise.id)).map((exercise) => ({ ...exercise, ...(data.exerciseOverrides[exercise.id] ?? {}) })), [data.customExercises, data.exerciseOverrides, data.hiddenExerciseIds]);
  useEffect(() => {
    let cancelled = false;
    setGifUrls({});
    setGifStorageError("");
    if (!accountId) return () => { cancelled = true; };
    void loadExerciseGifs(accountId).then((saved) => {
      if (cancelled) return;
      const urls = Object.fromEntries(Object.entries(saved).map(([id, blob]) => {
        const url = URL.createObjectURL(blob);
        objectUrls.current.add(url);
        return [id, url];
      }));
      setGifUrls(urls);
    }).catch((error: unknown) => {
      if (!cancelled) setGifStorageError(error instanceof Error ? error.message : "Não foi possível carregar seus GIFs locais.");
    });
    return () => {
      cancelled = true;
      for (const url of objectUrls.current) URL.revokeObjectURL(url);
      objectUrls.current.clear();
    };
  }, [accountId]);
  async function uploadGif(exercise: ExerciseDefinition, file?: File) {
    if (!accountId || !file) return;
    setGifUploading(exercise.id);
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
      setGifFeedbacks((current) => ({ ...current, [exercise.id]: { kind:"success", text:`GIF de ${exercise.name} salvo neste dispositivo.` } }));
    } catch (error) {
      setGifFeedbacks((current) => ({ ...current, [exercise.id]: { kind:"error", text:error instanceof Error ? error.message : "Não foi possível salvar esse GIF." } }));
    } finally {
      setGifUploading(null);
      const input = gifInputs.current[exercise.id];
      if (input) input.value = "";
    }
  }
  useEffect(() => {
    const openExercise = (event: Event) => { const id = (event as CustomEvent<string>).detail; const match = all.find((exercise) => exercise.id === id); if (match) setSelected(match); };
    window.addEventListener("monster-fit:select-exercise", openExercise);
    return () => window.removeEventListener("monster-fit:select-exercise", openExercise);
  }, [all]);
  const results = all.filter((exercise) => `${exercise.name} ${libraryGroup(exercise)} ${exercise.muscle} ${exercise.equipment} ${exercise.purpose ?? ""} ${exercise.description} ${exercise.instructions} ${(exercise.primaryMuscles ?? []).join(" ")} ${(exercise.secondaryMuscles ?? []).join(" ")}`.toLocaleLowerCase("pt-BR").includes(query.trim().toLocaleLowerCase("pt-BR")) && (muscle === "Todos" || libraryGroup(exercise) === muscle) && (equip === "Todos" || exercise.equipment === equip) && (!onlyFavorites || data.favorites.includes(exercise.id)));
  async function createCustom(submitEvent: React.FormEvent) {
    submitEvent.preventDefault(); setCustomError("");
    if (!customName.trim()) { setCustomError("Digite um nome para o exercício."); return; }
    if (!customDesc.trim()) { setCustomError("Digite uma descrição para o exercício."); return; }
    if (!customGif) { setCustomError("Escolha um GIF demonstrativo para o exercício."); return; }
    if (!accountId) { setCustomError("Entre no seu perfil local para salvar o GIF."); return; }
    const splitMuscles = (value: string) => value.split(",").map((item) => item.trim()).filter(Boolean);
    const definition: ExerciseDefinition = { id: makeId("custom"), name: customName.trim(), muscle: customMuscle, equipment: customEquipment, description: customDesc.trim() || "Exercício personalizado criado por você.", instructions: "Ajuste a execução de acordo com sua orientação profissional.", defaultSets: Math.min(10,Math.max(1,Number(customSets)||1)), defaultReps: customReps || "12", defaultRestSeconds: Math.max(0,Number(customRest)||0), purpose: customPurpose.trim() || undefined, primaryMuscles: splitMuscles(customPrimaryMuscles), secondaryMuscles: splitMuscles(customSecondaryMuscles), custom: true };
    setCustomSaving(true);
    try {
      await validateAnimatedExerciseGif(customGif);
      await saveExerciseGif(accountId, definition.id, customGif);
      const url = URL.createObjectURL(customGif);
      objectUrls.current.add(url);
      setGifUrls((current) => ({ ...current, [definition.id]: url }));
      window.dispatchEvent(new CustomEvent("monster-fit:add-custom-exercise", { detail: definition }));
      setCustomOpen(false); setCustomName(""); setCustomDesc(""); setCustomPurpose(""); setCustomPrimaryMuscles(""); setCustomSecondaryMuscles(""); clearCustomGif();
    } catch(error) { setCustomError(error instanceof Error ? error.message : "Não foi possível salvar o GIF neste dispositivo."); }
    finally { setCustomSaving(false); }
  }
  return <div className="library-browser">
    {showHeader && <PageHeading eyebrow="MOVIMENTO É LIBERDADE" title="Biblioteca de exercícios" description="Explore movimentos, salve seus favoritos e construa combinações do seu jeito." actions={<Button variant="secondary" onClick={() => setCustomOpen(true)}><Plus size={16}/> CRIAR EXERCÍCIO</Button>} />}
    {topContent}
    <div className="library-controls"><label className="library-search"><Search size={17}/><input value={query} onChange={(event)=>setQuery(event.target.value)} placeholder="Busque por exercício, músculo ou equipamento"/><kbd>⌘ K</kbd></label><Field label="Grupo muscular"><select value={muscle} onChange={(event)=>setMuscle(event.target.value)}>{muscles.map((item)=><option key={item}>{item}</option>)}</select></Field><Field label="Equipamento"><select value={equip} onChange={(event)=>setEquip(event.target.value)}>{equipment.map((item)=><option key={item}>{item}</option>)}</select></Field></div>
    {gifStorageError&&<div className="exercise-gif-storage-error" role="alert">{gifStorageError}</div>}
    <div className="library-toolbar"><span><Filter size={14}/> {results.length} exercícios encontrados</span><div className="library-toolbar-actions"><button type="button" className={`favorite-filter ${onlyFavorites?"active":""}`} aria-pressed={onlyFavorites} onClick={()=>setOnlyFavorites((value)=>!value)}><Heart size={13} fill={onlyFavorites?"currentColor":"none"}/> SÓ FAVORITOS</button><button className="text-link" onClick={()=>{setQuery("");setMuscle("Todos");setEquip("Todos");setOnlyFavorites(false);}}>Limpar filtros <X size={13}/></button></div></div>
    {results.length ? <div className="exercise-library-grid">{results.map((exercise,index)=><Card className="exercise-tile" key={exercise.id} style={{animationDelay:`${Math.min(index,8)*25}ms`}}>
      <button type="button" className="exercise-favorite" aria-label={data.favorites.includes(exercise.id)?`Remover ${exercise.name} dos favoritos`:`Favoritar ${exercise.name}`} onClick={()=>onFavorite(exercise.id)}><Heart size={17} fill={data.favorites.includes(exercise.id)?"currentColor":"none"}/></button>
      <button type="button" className="exercise-tile-main" onClick={()=>setSelected(exercise)}><div className={`exercise-art muscle-${exercise.muscle.toLowerCase().replaceAll(" ","-")}`}><span className="exercise-art-label">MONSTER MOVEMENT</span><div className="exercise-art-ring"/><Dumbbell size={33}/><span className="exercise-art-no">{String(index+1).padStart(2,"0")}</span>{(gifUrls[exercise.id]||exercise.imageUrl)&&<img src={gifUrls[exercise.id]||exercise.imageUrl} alt={`Demonstração de ${exercise.name}`} onError={(event)=>{event.currentTarget.style.display="none"}}/>}{EXERCISE_MEDIA_CREDITS[exercise.id] && <span className="exercise-media-credit">{EXERCISE_MEDIA_CREDITS[exercise.id]}</span>}</div><div className="exercise-tile-copy"><span className="eyebrow">{libraryGroup(exercise).toUpperCase()}</span><h3>{exercise.name}</h3>{exercise.primaryMuscles?.length ? <span className="exercise-muscle-preview">Foco · {exercise.primaryMuscles.join(" · ")}</span> : null}<div className="exercise-meta"><span>{exercise.equipment}</span><span>·</span><span>{exercise.defaultSets} × {exercise.defaultReps}</span></div></div></button>
      {accountId&&<><input ref={(element)=>{gifInputs.current[exercise.id]=element}} type="file" accept="image/gif,.gif" aria-label={`Escolher GIF animado para ${exercise.name}`} className="exercise-gif-input" onChange={(event)=>void uploadGif(exercise,event.currentTarget.files?.[0])}/><button type="button" className="exercise-gif-picker" aria-label={`Editar ${exercise.name}`} title={`Editar ${exercise.name}`} disabled={gifUploading===exercise.id} onClick={()=>setEditingExercise(exercise)}>{gifUploading===exercise.id?<LoaderCircle size={14}/>:<Pencil size={14}/>}</button></>}
      <div className="exercise-tile-footer">{gifFeedbacks[exercise.id]&&<span className={`exercise-gif-status ${gifFeedbacks[exercise.id].kind}`} role={gifFeedbacks[exercise.id].kind==="error"?"alert":"status"}>{gifFeedbacks[exercise.id].text}</span>}{exercise.custom && <Pill tone="amber">PERSONALIZADO</Pill>}<button type="button" className="add-mini" disabled={!onAdd || (selectedWorkout && selectedWorkout.exercises.some((item)=>item.name===exercise.name))} aria-label={`Adicionar ${exercise.name} ao treino`} onClick={()=>onAdd?.(exercise)}><Plus size={15}/> ADICIONAR</button></div>
    </Card>)}</div> : <EmptyState icon={<Search size={21}/>} title="Nenhum movimento encontrado." detail="Tente outro termo ou remova algum filtro para ampliar sua busca." />}
    <Modal open={!!selected} title={selected?.name || "Exercício"} eyebrow={`${selected?.muscle.toUpperCase() || ""} · ${selected?.equipment.toUpperCase() || ""}`} onClose={()=>setSelected(null)}><div className="exercise-detail"><div className="exercise-detail-art"><div className="exercise-art-ring large"/><Dumbbell size={52}/><span>MOVIMENTO MONSTER FIT</span>{selected&&(gifUrls[selected.id]||selected.imageUrl)&&<img src={gifUrls[selected.id]||selected.imageUrl} alt={`Demonstração de ${selected.name}`} onError={(event)=>{event.currentTarget.style.display="none"}}/>}{selected && EXERCISE_MEDIA_CREDITS[selected.id] && <span className="exercise-media-credit">{EXERCISE_MEDIA_CREDITS[selected.id]}</span>}</div><section className="exercise-muscle-focus" aria-label="Finalidade e foco muscular"><div><span className="eyebrow">AÇÃO E FINALIDADE</span><p>{selected?.purpose || selected?.description}</p></div>{selected?.primaryMuscles?.length ? <div><span className="eyebrow">MÚSCULOS PRINCIPAIS</span><p>{selected.primaryMuscles.join(" · ")}</p></div> : null}{selected?.secondaryMuscles?.length ? <div><span className="eyebrow">MÚSCULOS AUXILIARES / ESTABILIZADORES</span><p>{selected.secondaryMuscles.join(" · ")}</p></div> : null}</section><div className="exercise-instructions"><span className="eyebrow"><Sparkles size={13}/> ORIENTAÇÃO TÉCNICA</span><p>{selected?.instructions}</p></div><div className="exercise-detail-stats"><span><b>{selected?.defaultSets}</b> séries</span><span><b>{selected?.defaultReps}</b> reps</span><span><b>{selected?.defaultRestSeconds}s</b> descanso</span></div><div className="modal-actions"><Button variant="outline" onClick={()=>selected&&onFavorite(selected.id)}><Heart size={15} fill={selected&&data.favorites.includes(selected.id)?"currentColor":"none"}/>{selected&&data.favorites.includes(selected.id)?"SALVO":"FAVORITAR"}</Button>{onAdd&&<Button disabled={!selectedWorkout || !!selected&&selectedWorkout.exercises.some((item)=>item.name===selected.name)} onClick={()=>{if(selected)onAdd(selected);setSelected(null);}}><Plus size={15}/> ADICIONAR AO TREINO</Button>}</div></div></Modal>
    <Modal open={customOpen} title="Crie seu movimento" eyebrow="EXERCÍCIO PERSONALIZADO" onClose={()=>{if(!customSaving){setCustomOpen(false);clearCustomGif();setCustomError("");}}}><form className="custom-exercise-form" onSubmit={(event)=>void createCustom(event)}><Field label="Nome do exercício"><input value={customName} onChange={(event)=>setCustomName(event.target.value)} required placeholder="Ex.: Glúteo máquina"/></Field><div className="custom-two-cols"><Field label="Grupo muscular"><select value={customMuscle} onChange={(event)=>setCustomMuscle(event.target.value)}>{muscles.filter((item)=>item!=="Todos").map((item)=><option key={item}>{item}</option>)}</select></Field><Field label="Equipamento"><input value={customEquipment} onChange={(event)=>setCustomEquipment(event.target.value)} placeholder="Máquina, halter…"/></Field></div><Field label="Para que serve? (opcional)"><input value={customPurpose} onChange={(event)=>setCustomPurpose(event.target.value)} placeholder="Ex.: extensão de joelho contra resistência"/></Field><div className="custom-two-cols"><Field label="Músculos principais (separe por vírgulas)"><input value={customPrimaryMuscles} onChange={(event)=>setCustomPrimaryMuscles(event.target.value)} placeholder="Ex.: quadríceps, reto femoral"/></Field><Field label="Músculos auxiliares (opcional)"><input value={customSecondaryMuscles} onChange={(event)=>setCustomSecondaryMuscles(event.target.value)} placeholder="Ex.: vasto medial, vasto lateral"/></Field></div><Field label="Descrição"><textarea value={customDesc} onChange={(event)=>setCustomDesc(event.target.value)} rows={2} required placeholder="Descreva a execução ou observação sobre este movimento"/></Field><Field label="GIF animado"><input ref={customGifInput} type="file" accept="image/gif,.gif" aria-label="GIF demonstrativo do exercício" required onChange={(event)=>{setCustomGif(event.currentTarget.files?.[0]??null);setCustomError("");}}/><small>{customGif?customGif.name:"GIF obrigatório, até 12 MB."}</small></Field><div className="custom-three-cols"><Field label="Séries padrão"><input type="number" min="1" max="10" value={customSets} onChange={(event)=>setCustomSets(event.target.value)}/></Field><Field label="Repetições"><input value={customReps} onChange={(event)=>setCustomReps(event.target.value)}/></Field><Field label="Descanso (s)"><input type="number" min="0" value={customRest} onChange={(event)=>setCustomRest(event.target.value)}/></Field></div>{customError&&<div className="form-message error-message" role="alert">{customError}</div>}<div className="modal-actions"><Button type="button" variant="outline" disabled={customSaving} onClick={()=>{setCustomOpen(false);clearCustomGif();setCustomError("");}}>CANCELAR</Button><Button type="submit" disabled={customSaving}>{customSaving?<LoaderCircle size={15}/>:<Plus size={15}/>} {customSaving?"SALVANDO…":"CRIAR EXERCÍCIO"}</Button></div><small>O novo movimento será salvo na sua biblioteca pessoal junto com o GIF demonstrativo.</small></form></Modal>
    <ExerciseEditorModal exercise={editingExercise} gifUrl={editingExercise ? gifUrls[editingExercise.id] || editingExercise.imageUrl : undefined} gifUploading={editingExercise ? gifUploading === editingExercise.id : false} onClose={() => setEditingExercise(null)} onGifChange={(file) => editingExercise && void uploadGif(editingExercise, file)} onSave={(value) => { if (editingExercise && onSaveExercise && !("metricLabel" in value)) { onSaveExercise(value as ExerciseDefinition); setEditingExercise(null); } }} onDelete={() => { if (editingExercise && onDeleteExercise) { onDeleteExercise(editingExercise); setEditingExercise(null); } }} />
  </div>;
}

export default function ExerciseLibraryPage({ data, accountId, onFavorite, workouts, onAddToWorkout, onCreateWorkout, onSaveExercise, onDeleteExercise }: { data: BellaData; accountId:string; onFavorite: (id: string)=>void; workouts:Workout[]; onAddToWorkout:(exercise:ExerciseDefinition,workoutId?:string)=>void;onCreateWorkout:()=>void; onSaveExercise:(exercise:ExerciseDefinition)=>void; onDeleteExercise:(exercise:ExerciseDefinition)=>void }) {
  const [workoutId,setWorkoutId]=useState(workouts[0]?.id??"");
  const selectedWorkout=workouts.find((workout)=>workout.id===workoutId);
  const addBar = <div className="library-add-bar library-add-bar-top"><div><span className="eyebrow">ADICIONAR AO SEU TREINO</span><strong>{workouts.length?"Escolha uma rotina para receber o exercício.":"Você ainda não criou uma rotina."}</strong></div>{workouts.length?<><Field label="SELECIONE UM TREINO"><select value={workoutId} onChange={(event)=>setWorkoutId(event.target.value)}>{workouts.map((workout)=><option key={workout.id} value={workout.id}>{workout.title}</option>)}</select></Field><span className="library-add-hint">Toque em “Adicionar” em qualquer movimento.</span></>:<Button onClick={onCreateWorkout}><Plus size={15}/> CRIAR TREINO</Button>}</div>;
  return <div className="page"><ExerciseBrowser data={data} selectedWorkout={selectedWorkout} onAdd={workouts.length?((exercise)=>onAddToWorkout(exercise,workoutId)):undefined} onFavorite={onFavorite} showHeader topContent={addBar} accountId={accountId} onSaveExercise={onSaveExercise} onDeleteExercise={onDeleteExercise}/></div>;
}
