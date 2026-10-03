import { useEffect, useRef, useState } from "react";
import { ImagePlus, Save, Trash2, Upload } from "lucide-react";
import type { ExerciseDefinition, TafExerciseOverride, TafUnit } from "../types";
import type { TafExercise } from "../lib/tafService";
import { Button, Field, Modal } from "./common";

type Props = {
  exercise: ExerciseDefinition | TafExercise | null;
  gifUrl?: string;
  onClose: () => void;
  onSave: (value: ExerciseDefinition | TafExerciseOverride) => void;
  onDelete: () => void;
  onGifChange: (file: File) => void;
  gifUploading?: boolean;
};

function isTafExercise(value: ExerciseDefinition | TafExercise): value is TafExercise {
  return "metricLabel" in value && "defaultUnit" in value;
}

export default function ExerciseEditorModal({ exercise, gifUrl, onClose, onSave, onDelete, onGifChange, gifUploading = false }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const taf = exercise ? isTafExercise(exercise) : false;
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [muscle, setMuscle] = useState("");
  const [equipment, setEquipment] = useState("");
  const [purpose, setPurpose] = useState("");
  const [description, setDescription] = useState("");
  const [instructions, setInstructions] = useState("");
  const [primaryMuscles, setPrimaryMuscles] = useState("");
  const [secondaryMuscles, setSecondaryMuscles] = useState("");
  const [sets, setSets] = useState("3");
  const [reps, setReps] = useState("12");
  const [rest, setRest] = useState("60");
  const [metricLabel, setMetricLabel] = useState("");
  const [unit, setUnit] = useState<TafUnit>("reps");
  const [unitLabel, setUnitLabel] = useState("");
  const [higherIsBetter, setHigherIsBetter] = useState(true);
  const [cue, setCue] = useState("");

  useEffect(() => {
    if (!exercise) return;
    setName(exercise.name);
    if (isTafExercise(exercise)) {
      setCategory(exercise.category); setPurpose(exercise.purpose); setMuscle(exercise.muscles);
      setMetricLabel(exercise.metricLabel); setUnit(exercise.defaultUnit); setUnitLabel(exercise.unitLabel);
      setHigherIsBetter(exercise.higherIsBetter); setCue(exercise.cue);
    } else {
      setMuscle(exercise.muscle); setEquipment(exercise.equipment); setPurpose(exercise.purpose ?? "");
      setDescription(exercise.description); setInstructions(exercise.instructions);
      setPrimaryMuscles((exercise.primaryMuscles ?? []).join(", ")); setSecondaryMuscles((exercise.secondaryMuscles ?? []).join(", "));
      setSets(String(exercise.defaultSets)); setReps(exercise.defaultReps); setRest(String(exercise.defaultRestSeconds));
    }
  }, [exercise]);

  if (!exercise) return null;
  const save = (event: React.FormEvent) => {
    event.preventDefault();
    if (taf) {
      onSave({ name: name.trim(), category: category.trim(), purpose: purpose.trim(), muscles: muscle.trim(), metricLabel: metricLabel.trim(), defaultUnit: unit, unitLabel: unitLabel.trim() || unit, higherIsBetter, cue: cue.trim() });
    } else {
      const split = (value: string) => value.split(",").map((item) => item.trim()).filter(Boolean);
      onSave({ ...exercise, name: name.trim(), muscle: muscle.trim(), equipment: equipment.trim(), purpose: purpose.trim() || undefined, description: description.trim(), instructions: instructions.trim(), primaryMuscles: split(primaryMuscles), secondaryMuscles: split(secondaryMuscles), defaultSets: Math.min(10, Math.max(1, Number(sets) || 1)), defaultReps: reps.trim() || "12", defaultRestSeconds: Math.max(0, Number(rest) || 0) });
    }
  };
  return <Modal open={!!exercise} title={`Editar ${exercise.name}`} eyebrow={taf ? "MODALIDADE TAF" : "EXERCÍCIO"} onClose={onClose} wide>
    <form className="exercise-editor-form" onSubmit={save}>
      <div className="exercise-editor-gif-row"><div className="exercise-editor-preview">{gifUrl ? <img src={gifUrl} alt={`Imagem de ${name}`} /> : <ImagePlus size={28} />}</div><div><strong>Imagem ou GIF do exercício</strong><p>{gifUrl ? "Substitua a imagem ou GIF atual quando quiser." : "Adicione um GIF ou uma foto para demonstrar o movimento."}</p><input ref={inputRef} type="file" accept="image/*,.gif" className="exercise-gif-input" onChange={(event) => { const file = event.currentTarget.files?.[0]; if (file) onGifChange(file); event.currentTarget.value = ""; }} /><Button type="button" variant="secondary" disabled={gifUploading} onClick={() => inputRef.current?.click()}><Upload size={15} /> {gifUploading ? "SALVANDO..." : gifUrl ? "SUBSTITUIR MÍDIA" : "ADICIONAR MÍDIA"}</Button></div></div>
      <Field label="Nome do exercício"><input value={name} onChange={(event) => setName(event.target.value)} required /></Field>
      {taf ? <>
        <div className="custom-two-cols"><Field label="Categoria"><input value={category} onChange={(event) => setCategory(event.target.value)} /></Field><Field label="Métrica"><input value={metricLabel} onChange={(event) => setMetricLabel(event.target.value)} /></Field></div>
        <div className="custom-three-cols"><Field label="Unidade"><select value={unit} onChange={(event) => setUnit(event.target.value as TafUnit)}><option value="reps">Repetições</option><option value="s">Segundos</option><option value="m">Metros</option><option value="cm">Centímetros</option></select></Field><Field label="Rótulo da unidade"><input value={unitLabel} onChange={(event) => setUnitLabel(event.target.value)} /></Field><Field label="Melhor resultado"><select value={higherIsBetter ? "higher" : "lower"} onChange={(event) => setHigherIsBetter(event.target.value === "higher")}><option value="higher">Maior é melhor</option><option value="lower">Menor é melhor</option></select></Field></div>
        <Field label="Finalidade"><textarea value={purpose} onChange={(event) => setPurpose(event.target.value)} rows={3} /></Field><Field label="Foco muscular / físico"><textarea value={muscle} onChange={(event) => setMuscle(event.target.value)} rows={2} /></Field><Field label="Orientação"><textarea value={cue} onChange={(event) => setCue(event.target.value)} rows={3} /></Field>
      </> : <>
        <div className="custom-two-cols"><Field label="Grupo muscular"><input value={muscle} onChange={(event) => setMuscle(event.target.value)} /></Field><Field label="Equipamento"><input value={equipment} onChange={(event) => setEquipment(event.target.value)} /></Field></div>
        <Field label="Para que serve?"><textarea value={purpose} onChange={(event) => setPurpose(event.target.value)} rows={2} /></Field><Field label="Descrição"><textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={3} /></Field><Field label="Instruções de execução"><textarea value={instructions} onChange={(event) => setInstructions(event.target.value)} rows={3} /></Field>
        <div className="custom-two-cols"><Field label="Músculos principais"><input value={primaryMuscles} onChange={(event) => setPrimaryMuscles(event.target.value)} placeholder="Separe por vírgulas" /></Field><Field label="Músculos auxiliares"><input value={secondaryMuscles} onChange={(event) => setSecondaryMuscles(event.target.value)} placeholder="Separe por vírgulas" /></Field></div>
        <div className="custom-three-cols"><Field label="Séries padrão"><input type="number" min="1" max="10" value={sets} onChange={(event) => setSets(event.target.value)} /></Field><Field label="Repetições"><input value={reps} onChange={(event) => setReps(event.target.value)} /></Field><Field label="Descanso (s)"><input type="number" min="0" value={rest} onChange={(event) => setRest(event.target.value)} /></Field></div>
      </>}
      <div className="modal-actions"><Button type="button" variant="danger" onClick={onDelete}><Trash2 size={15} /> APAGAR EXERCÍCIO</Button><span className="modal-actions-spacer" /><Button type="button" variant="outline" onClick={onClose}>CANCELAR</Button><Button type="submit"><Save size={15} /> SALVAR ALTERAÇÕES</Button></div>
    </form>
  </Modal>;
}
