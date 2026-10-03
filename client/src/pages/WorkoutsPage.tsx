import { Copy, Dumbbell, Ellipsis, Pencil, Play, Plus, Trash2 } from "lucide-react";
import type { BellaData, Workout } from "../types";
import { DAYS } from "../lib/catalog";
import { Button, Card, EmptyState, PageHeading, Pill } from "../components/common";

export default function WorkoutsPage({ data, onCreate, onEdit, onDuplicate, onDelete, onStart }: { data: BellaData; onCreate: () => void; onEdit: (workout: Workout) => void; onDuplicate: (workout: Workout) => void; onDelete: (workout: Workout) => void; onStart: (workout: Workout) => void }) {
  const totalExercises = data.workouts.reduce((sum, workout) => sum + workout.exercises.length, 0);
  return <div className="page">
    <PageHeading eyebrow="ROTINAS QUE CABEM EM VOCÊ" title="Meus treinos" description={`${data.workouts.length} ${data.workouts.length === 1 ? "rotina criada" : "rotinas criadas"} · ${totalExercises} exercícios no total`} actions={<Button onClick={onCreate}><Plus size={17}/> NOVO TREINO</Button>} />
    {data.workouts.length === 0 ? <EmptyState icon={<Dumbbell size={23}/>} title="Seu próximo treino está esperando." detail="Crie uma rotina com os exercícios, séries e descansos que fazem sentido para você." action={<Button onClick={onCreate}><Plus size={17}/> Criar meu primeiro treino</Button>} /> : <div className="workout-grid">{data.workouts.map((workout,index) => <Card className="workout-card" key={workout.id} style={{ animationDelay: `${Math.min(index,8)*35}ms` }}>
      <div className="workout-card-top"><span className="workout-color-dot" style={{ background: workout.color }}/><Pill tone="neutral">{workout.days.length ? workout.days.map((day) => DAYS.find((item) => item.key === day)?.short).join(" · ") : "SEM DIA DEFINIDO"}</Pill><div className="workout-actions"><button type="button" title="Editar treino" aria-label={`Editar ${workout.title}`} onClick={() => onEdit(workout)}><Pencil size={16}/></button><button type="button" title="Duplicar treino" aria-label={`Duplicar ${workout.title}`} onClick={() => onDuplicate(workout)}><Copy size={16}/></button><button type="button" title="Excluir treino" aria-label={`Excluir ${workout.title}`} className="delete-icon" onClick={() => onDelete(workout)}><Trash2 size={16}/></button></div></div>
      <div className="workout-card-body"><span className="eyebrow">ROTINA {String(index+1).padStart(2,"0")}</span><h2>{workout.title}</h2><p>{workout.description || "Uma rotina feita por você."}</p>
        <div className="workout-card-stats"><span><Dumbbell size={14}/>{workout.exercises.length} exercícios</span><span>{workout.exercises.reduce((sum,e)=>sum+e.sets.length,0)} séries</span></div>
        <div className="workout-exercise-preview">{workout.exercises.slice(0,3).map((exercise) => <span key={exercise.id}>{exercise.name}</span>)}{workout.exercises.length > 3 && <span>+ {workout.exercises.length-3} exercícios</span>}{workout.exercises.length === 0 && <span>Adicione exercícios para completar sua rotina</span>}</div>
      </div>
      <div className="workout-card-footer"><button type="button" className="workout-edit-link" onClick={() => onEdit(workout)}>EDITAR ROTINA <Pencil size={13}/></button><Button variant="secondary" size="sm" onClick={() => onStart(workout)} disabled={!workout.exercises.length}><Play size={14} fill="currentColor"/> INICIAR</Button></div>
    </Card>)}</div>}
    {data.workouts.length > 0 && <button type="button" className="add-workout-tile" onClick={onCreate}><span><Plus size={20}/></span><strong>Uma nova rotina?</strong><small>Crie um treino do seu jeito.</small></button>}
  </div>;
}
