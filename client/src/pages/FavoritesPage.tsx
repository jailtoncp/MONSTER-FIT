import { useState } from "react";
import { Heart, Search } from "lucide-react";
import type { BellaData, ExerciseDefinition } from "../types";
import { EXERCISE_CATALOG } from "../lib/catalog";
import { Button, Card, EmptyState, PageHeading, Pill } from "../components/common";

export default function FavoritesPage({ data, onFavorite }: { data: BellaData; onFavorite: (id:string)=>void }) {
  const [query,setQuery]=useState("");
  const selected=[...EXERCISE_CATALOG,...data.customExercises].filter((item)=>data.favorites.includes(item.id));
  const filtered=selected.filter((item)=>item.name.toLocaleLowerCase("pt-BR").includes(query.toLocaleLowerCase("pt-BR")));
  if (!selected.length) return <div className="page"><PageHeading eyebrow="SEU CANTINHO DE INSPIRAÇÃO" title="Favoritos" description="Guarde aqui os exercícios para encontrar rapidinho."/><EmptyState icon={<Heart size={22}/>} title="Ainda não há favoritos." detail="Toque no coração de qualquer exercício para adicioná-lo aos seus favoritos." action={<Button variant="secondary" onClick={()=>window.dispatchEvent(new CustomEvent("monster-fit:navigate",{detail:"library"}))}>Explorar exercícios</Button>}/></div>;
  return <div className="page"><PageHeading eyebrow="SEU CANTINHO DE INSPIRAÇÃO" title="Favoritos" description={`${selected.length} movimentos salvos para você.`}/><label className="library-search favorites-search"><Search size={16}/><input value={query} onChange={(event)=>setQuery(event.target.value)} placeholder="Buscar entre favoritos"/></label><div className="exercise-library-grid favorites-grid">{filtered.map((exercise,index)=><FavoriteCard key={exercise.id} exercise={exercise} index={index} onFavorite={onFavorite}/>)}</div>{!filtered.length&&<EmptyState icon={<Search size={20}/>} title="Não encontramos esse favorito." detail="Tente outra palavra."/>}</div>;
}
function FavoriteCard({exercise,index,onFavorite}:{exercise:ExerciseDefinition;index:number;onFavorite:(id:string)=>void}) {
  return <Card className="exercise-tile" style={{animationDelay:`${index*25}ms`}}><button type="button" className="exercise-favorite" onClick={()=>onFavorite(exercise.id)} aria-label={`Remover ${exercise.name} dos favoritos`}><Heart size={17} fill="currentColor"/></button><div className="exercise-art"><span className="exercise-art-label">MONSTER MOVEMENT</span><div className="exercise-art-ring"/><span className="exercise-art-no">♡</span></div><div className="exercise-tile-copy"><span className="eyebrow">{exercise.muscle.toUpperCase()}</span><h3>{exercise.name}</h3><div className="exercise-meta">{exercise.equipment} · {exercise.defaultSets} × {exercise.defaultReps}</div></div><div className="exercise-tile-footer">{exercise.custom&&<Pill tone="amber">PERSONALIZADO</Pill>}<span className="favorite-tag"><Heart size={13} fill="currentColor"/> SALVO</span></div></Card>;
}
