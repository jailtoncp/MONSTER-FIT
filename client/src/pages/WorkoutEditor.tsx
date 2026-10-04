import { useEffect, useState } from "react";
import { ArrowDown, ArrowLeft, ArrowUp, Clock3, GripVertical, ListPlus, Plus, Save, Trash2, X } from "lucide-react";
import type { BellaData, DayKey, ExerciseDefinition, Workout, WorkoutExercise } from "../types";
import { DAYS, makeId, WORKOUT_COLORS } from "../lib/catalog";
import { Button, Card, Field, Modal, PageHeading, Pill } from "../components/common";
import { ExerciseBrowser } from "./ExerciseLibrary";
import { appendExerciseToWorkout } from "../lib/programService";

function move<T>(items: T[], from: number, to: number): T[] { const next = [...items]; const [item] = next.splice(from, 1); next.splice(to, 0, item); return next; }

export default function WorkoutEditor({ workout, data, onChange, onBack, onFavorite }: { workout: Workout; data: BellaData; onChange: (next: Workout) => void; onBack: () => void; onFavorite: (id: string) => void }) {
  const [showLibrary, setShowLibrary] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [draft, setDraft] = useState(workout);
  useEffect(() => { setDraft(workout); }, [workout.id]);
  const apply = (partial: Partial<Workout>) => { const next = { ...draft, ...partial, updatedAt: new Date().toISOString() }; setDraft(next); onChange(next); };
  const addExercise = (definition: ExerciseDefinition) => {
    const next = appendExerciseToWorkout(draft, definition);
    if (next !== draft) { setDraft(next); onChange(next); }
  };
  const updateExercise = (index: number, partial: Partial<WorkoutExercise>) => apply({ exercises: draft.exercises.map((exercise,i) => i === index ? { ...exercise, ...partial } : exercise) });
  const updateSet = (exerciseIndex: number, setIndex: number, field: "reps" | "weight" | "method" | "seconds", value: string | number) => {
    const exercise = draft.exercises[exerciseIndex];
    updateExercise(exerciseIndex, { sets: exercise.sets.map((set,i) => i === setIndex ? { ...set, [field]: value } : set) });
  };
  const addSet = (exerciseIndex: number) => {
    const exercise = draft.exercises[exerciseIndex]; if (exercise.sets.length >= 10) return;
    const previous = exercise.sets[exercise.sets.length-1];
    updateExercise(exerciseIndex, { sets: [...exercise.sets, { ...previous, id: makeId("set") }] });
  };
  const removeSet = (exerciseIndex: number, setIndex: number) => {
    const exercise = draft.exercises[exerciseIndex]; if (exercise.sets.length <= 1) return;
    updateExercise(exerciseIndex, { sets: exercise.sets.filter((_,i) => i !== setIndex) });
  };
  const removeExercise = (index: number) => apply({ exercises: draft.exercises.filter((_,i) => i !== index) });
  const setDay = (day: DayKey) => apply({ days: draft.days.includes(day) ? draft.days.filter((item) => item !== day) : [...draft.days, day] });
  const reorder = (from: number, to: number) => { if (from < 0 || to < 0 || to >= draft.exercises.length || from === to) return; apply({ exercises: move(draft.exercises, from, to) }); };

  return <div className="page editor-page">
    <button type="button" className="back-link" onClick={onBack}><ArrowLeft size={16}/> VOLTAR AOS MEUS TREINOS</button>
    <PageHeading eyebrow="DO SEU JEITO, NO SEU TEMPO" title="Editor de treino" description="Sua rotina é flexível. Ajuste quando quiser — suas mudanças são salvas automaticamente." actions={<Pill tone="green"><Save size={12}/> SALVAMENTO AUTOMÁTICO</Pill>} />
    <div className="editor-layout">
      <section className="editor-main">
        <Card className="editor-overview">
          <div className="eyebrow">DETALHES DA ROTINA</div>
          <div className="editor-fields"><Field label="Nome do treino"><input value={draft.title} maxLength={36} onChange={(event) => apply({ title: event.target.value })} placeholder="Ex.: Treino A · Inferiores" /></Field><Field label="Descrição"><input value={draft.description} maxLength={90} onChange={(event) => apply({ description: event.target.value })} placeholder="Ex.: Glúteos + posterior" /></Field></div>
          <div className="editor-field-block"><span className="field-caption">DIAS DA SEMANA</span><div className="day-picker">{DAYS.map((day) => <button key={day.key} type="button" className={`day-pill ${draft.days.includes(day.key) ? "selected" : ""}`} onClick={() => setDay(day.key)}>{day.short}</button>)}</div></div>
          <div className="editor-field-block"><span className="field-caption">COR DA ROTINA</span><div className="color-picker">{WORKOUT_COLORS.map((color) => <button key={color} type="button" className={`color-option ${draft.color === color ? "chosen" : ""}`} style={{ background: color }} aria-label={`Usar cor ${color}`} aria-pressed={draft.color===color} onClick={() => apply({ color })}/>)}</div></div>
        </Card>
        <div className="exercise-editor-heading"><div><span className="eyebrow">SUA SEQUÊNCIA</span><h2>Exercícios <span>{draft.exercises.length}</span></h2></div><Button className="add-exercise-button" variant="secondary" onClick={() => setShowLibrary(true)}><ListPlus size={16}/> ADICIONAR EXERCÍCIO</Button></div>
        {draft.exercises.length === 0 ? <Card className="editor-empty"><div className="editor-empty-graphic"><DumbbellIcon/></div><h3>Seu treino começa aqui.</h3><p>Adicione um exercício da biblioteca ou crie o seu próprio para montar uma rotina completa.</p><Button onClick={() => setShowLibrary(true)}><Plus size={16}/> ESCOLHER EXERCÍCIOS</Button></Card> : <div className="exercise-editor-list">{draft.exercises.map((exercise,index) => <Card className="exercise-editor-card" key={`${exercise.id}-${index}`} draggable onDragStart={() => setDragIndex(index)} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); if (dragIndex !== null) reorder(dragIndex,index); setDragIndex(null); }} onDragEnd={() => setDragIndex(null)}>
          <div className="exercise-editor-top"><div className="exercise-order"><button type="button" title="Arrastar para reorganizar" aria-label="Arraste para reorganizar"><GripVertical size={18}/></button><span>{String(index+1).padStart(2,"0")}</span></div><div className="exercise-editor-title"><div className="eyebrow">{exercise.muscle.toUpperCase()} · {exercise.equipment.toUpperCase()}</div><h3>{exercise.name}</h3>{exercise.primaryMuscles?.length ? <span className="exercise-muscle-preview">Foco · {exercise.primaryMuscles.join(" · ")}</span> : null}</div><div className="order-buttons"><button title="Mover para cima" aria-label="Mover exercício para cima" disabled={index===0} onClick={() => reorder(index,index-1)}><ArrowUp size={15}/></button><button title="Mover para baixo" aria-label="Mover exercício para baixo" disabled={index===draft.exercises.length-1} onClick={() => reorder(index,index+1)}><ArrowDown size={15}/></button></div><button type="button" className="delete-icon" title="Remover exercício" aria-label={`Remover ${exercise.name}`} onClick={() => removeExercise(index)}><Trash2 size={16}/></button></div>
          <div className="exercise-custom-fields"><Field label="Nome do exercício"><input value={exercise.name} onChange={(event)=>updateExercise(index,{name:event.target.value})}/></Field><Field label="Grupo muscular"><input value={exercise.muscle} onChange={(event)=>updateExercise(index,{muscle:event.target.value})}/></Field><Field label="Equipamento"><input value={exercise.equipment} onChange={(event)=>updateExercise(index,{equipment:event.target.value})}/></Field><Field label="URL opcional de GIF, imagem ou vídeo"><input value={exercise.imageUrl||""} onChange={(event)=>updateExercise(index,{imageUrl:event.target.value||undefined})} placeholder="https://…" type="url"/></Field></div>
          <div className="set-table-wrap"><table className="set-table"><thead><tr><th>SÉRIE</th><th>MÉTODO</th><th>REPS</th><th>CARGA ({data.settings.weightUnit.toUpperCase()})</th><th>TEMPO (s)</th><th></th></tr></thead><tbody>{exercise.sets.map((set,setIndex) => <tr key={set.id}><td><span className="set-number">{String(setIndex+1).padStart(2,"0")}</span></td><td><select value={set.method} onChange={(event) => updateSet(index,setIndex,"method",event.target.value as typeof set.method)} aria-label={`Método da série ${setIndex+1}`}><option>Repetições</option><option>Tempo</option><option>Falha</option><option>Até a falha</option><option>Isometria</option></select></td><td><input value={set.reps} onChange={(event) => updateSet(index,setIndex,"reps",event.target.value)} aria-label={`Repetições da série ${setIndex+1}`} /></td><td><input value={set.weight} onChange={(event) => updateSet(index,setIndex,"weight",event.target.value)} type="number" min="0" step="0.5" placeholder="—" aria-label={`Carga da série ${setIndex+1}`} /></td><td><input type="number" value={set.seconds} min={0} onChange={(event)=>updateSet(index,setIndex,"seconds",Number(event.target.value))} aria-label={`Tempo da série ${setIndex+1}`} /></td><td><button className="tiny-icon" aria-label="Remover série" disabled={exercise.sets.length<=1} onClick={() => removeSet(index,setIndex)}><X size={14}/></button></td></tr>)}</tbody></table></div>
          <div className="exercise-card-tools"><button type="button" className="text-link" disabled={exercise.sets.length>=10} onClick={() => addSet(index)}><Plus size={14}/> Adicionar série</button><div className="rest-setting"><Clock3 size={14}/><label>Descanso</label><input type="number" min={0} step={5} value={exercise.restSeconds} onChange={(event) => updateExercise(index,{restSeconds:Math.max(0,Number(event.target.value))})}/><span>seg</span></div></div>
          <Field label="Observação"><input value={exercise.note} onChange={(event) => updateExercise(index,{note:event.target.value})} placeholder="Ex.: Manter 2 segundos no topo" /></Field>
          <div className="mobile-order-controls"><button type="button" onClick={() => reorder(index,index-1)} disabled={index===0}><ArrowUp size={14}/> Mover para cima</button><button type="button" onClick={() => reorder(index,index+1)} disabled={index===draft.exercises.length-1}><ArrowDown size={14}/> Mover para baixo</button></div>
        </Card>)}</div>}
      </section>
      <aside className="editor-aside"><Card className="editor-summary"><div className="summary-color-stripe" style={{background:draft.color}}/><div className="eyebrow">RESUMO DA ROTINA</div><h3>{draft.title || "Novo treino"}</h3><p>{draft.description || "Sem descrição por enquanto"}</p><div className="summary-stat"><span>Exercícios</span><strong>{draft.exercises.length}</strong></div><div className="summary-stat"><span>Séries previstas</span><strong>{draft.exercises.reduce((sum,e)=>sum+e.sets.length,0)}</strong></div><div className="summary-stat"><span>Tempo de descanso</span><strong>{Math.round(draft.exercises.reduce((sum,e)=>sum+e.restSeconds*Math.max(0,e.sets.length-1),0)/60)} min</strong></div><div className="summary-days">{draft.days.length ? draft.days.map((day)=><Pill key={day} tone="rose">{DAYS.find((item)=>item.key===day)?.short}</Pill>) : <span>Nenhum dia marcado</span>}</div><Button className="summary-start" onClick={onBack}><Save size={15}/> CONCLUÍDO</Button></Card><Card className="editor-tip"><span className="tip-spark">✳</span><strong>Um lembrete gentil</strong><p>O treino ideal é aquele que funciona para você hoje. Você pode ajustar tudo depois.</p></Card></aside>
    </div>
    <Modal open={showLibrary} title="Adicionar exercício" eyebrow="BIBLIOTECA MONSTER FIT" onClose={() => setShowLibrary(false)} wide><ExerciseBrowser data={data} selectedWorkout={draft} onAdd={(definition) => { addExercise(definition); }} onFavorite={onFavorite} showHeader={false} /></Modal>
  </div>;
}

function DumbbellIcon() { return <span className="editor-empty-icon"><span/><i/><span/></span>; }
