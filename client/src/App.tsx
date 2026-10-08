import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, Search } from "lucide-react";
import AuthScreen from "./components/AuthScreen";
import OwnerFooter from "./components/OwnerFooter";
import AppShell from "./components/AppShell";
import { Button, Modal } from "./components/common";
import Dashboard from "./pages/Dashboard";
import WorkoutsPage from "./pages/WorkoutsPage";
import WorkoutEditor from "./pages/WorkoutEditor";
import ExerciseLibraryPage from "./pages/ExerciseLibrary";
import TafPage from "./pages/TafPage";
import FavoritesPage from "./pages/FavoritesPage";
import WorkoutRunner from "./pages/WorkoutRunner";
import HistoryPage from "./pages/HistoryPage";
import CalendarPage from "./pages/CalendarPage";
import EvolutionPage from "./pages/EvolutionPage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import CoachPage from "./pages/CoachPage";
import { useBellaFit } from "./hooks/useBellaFit";
import { createInitialData, saveData, validateBackup } from "./lib/storageService";
import { checkpointActiveWorkout, createActiveWorkout, pauseActiveWorkout, recoverActiveWorkout, resumeActiveWorkout } from "./lib/workoutSession";
import { appendExerciseToWorkout, assignScheduledWorkout, duplicateWorkout as createWorkoutCopy, updateWorkoutSchedule } from "./lib/programService";
import { getDailyWorkoutReminder, reminderStorageKey } from "./lib/notificationService";
import { appAssetUrl } from "./lib/assetPaths";
import { EXERCISE_CATALOG, makeId, WORKOUT_COLORS } from "./lib/catalog";
import type { ActiveWorkout, BellaData, CustomTafExercise, DayKey, ExerciseDefinition, PageId, PerformedSet, TafAttempt, TafExerciseOverride, Workout } from "./types";
import { appendTafAttempt } from "./lib/tafService";

export default function App() {
  const { account, data, updateData, auth, storageError } = useBellaFit();
  const [page, setPage] = useState<PageId>("home");
  const [editingId, setEditingId] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Workout | null>(null);
  const [abandonPrompt, setAbandonPrompt] = useState<Workout | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const currentPageRef = useRef<PageId>(page);
  const initializedAccountRef = useRef<string | null>(null);

  function checkpointRunningWorkout() {
    if (!account || !data?.activeWorkout || data.activeWorkout.isPaused) return;
    const paused = pauseActiveWorkout(data.activeWorkout);
    const snapshot = { ...data, activeWorkout: paused };
    updateData((current) => current.activeWorkout?.workoutId === paused.workoutId ? { ...current, activeWorkout: paused } : current);
    try { saveData(account, snapshot); } catch { /* O aviso de armazenamento já cobre a falha de persistência. */ }
  }

  useEffect(() => {
    if (!account || !data) { initializedAccountRef.current = null; return; }
    if (initializedAccountRef.current === account.id) return;
    initializedAccountRef.current = account.id;
    if (data.activeWorkout && !data.activeWorkout.isPaused) {
      const paused = recoverActiveWorkout(data.activeWorkout);
      const snapshot = { ...data, activeWorkout: paused };
      updateData((current) => ({ ...current, activeWorkout: paused }));
      try { saveData(account, snapshot); } catch { /* O estado continua em memória; a persistência será tentada novamente. */ }
    }
  }, [account, data, updateData]);

  useEffect(() => {
    const pauseIfHidden = () => { if (document.visibilityState === "hidden") checkpointRunningWorkout(); };
    window.addEventListener("pagehide", checkpointRunningWorkout);
    document.addEventListener("visibilitychange", pauseIfHidden);
    return () => {
      window.removeEventListener("pagehide", checkpointRunningWorkout);
      document.removeEventListener("visibilitychange", pauseIfHidden);
    };
  }, [account, data, updateData]);

  useEffect(() => {
    if (currentPageRef.current === "runner" && page !== "runner") checkpointRunningWorkout();
    currentPageRef.current = page;
  }, [page, account, data, updateData]);

  useEffect(() => {
    if (!account || !data?.activeWorkout || data.activeWorkout.isPaused) return;
    const active = data.activeWorkout;
    const timer = window.setInterval(() => {
      const checkpoint = checkpointActiveWorkout(active);
      const snapshot = { ...data, activeWorkout: checkpoint };
      updateData((current) => current.activeWorkout?.workoutId === active.workoutId && !current.activeWorkout.isPaused ? { ...current, activeWorkout: checkpoint } : current);
      try { saveData(account, snapshot); } catch { /* A persistência é repetida no próximo heartbeat e ao sair. */ }
    }, 15_000);
    return () => window.clearInterval(timer);
  }, [account, data, updateData]);

  useEffect(() => {
    const requestNavigation = (event: Event) => { const value = (event as CustomEvent<PageId>).detail; if (value) setPage(value); };
    const requestWorkout = () => createWorkout();
    window.addEventListener("monster-fit:navigate", requestNavigation);
    window.addEventListener("monster-fit:new-workout", requestWorkout);
    return () => { window.removeEventListener("monster-fit:navigate", requestNavigation); window.removeEventListener("monster-fit:new-workout", requestWorkout); };
  });

  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<ExerciseDefinition>).detail;
      if (detail) updateData((current) => current.customExercises.some((item) => item.id === detail.id) ? current : { ...current, customExercises: [...current.customExercises, detail] });
    };
    window.addEventListener("monster-fit:add-custom-exercise", handler);
    return () => window.removeEventListener("monster-fit:add-custom-exercise", handler);
  }, [updateData]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", data?.settings.theme === "dark");
  }, [data?.settings.theme]);

  useEffect(() => {
    const onInstalled = () => setIsInstalled(true);
    window.addEventListener("appinstalled", onInstalled);
    return () => window.removeEventListener("appinstalled", onInstalled);
  }, []);

  useEffect(() => {
    if (!account || !data?.settings.notifications || !("Notification" in window) || Notification.permission !== "granted") return;
    const now = new Date();
    const workout = getDailyWorkoutReminder(data, now);
    if (!workout) return;
    const key = reminderStorageKey(account.id, now);
    if (localStorage.getItem(key)) return;
    let mounted = true;
    void (async () => {
      try {
        if ("serviceWorker" in navigator) {
          const registration = await navigator.serviceWorker.ready;
          await registration.showNotification("Monster Fit · seu treino de hoje", {
            body: `${workout.title}${workout.description ? ` · ${workout.description}` : ""} está na sua agenda. Comece no seu ritmo.`,
            icon: appAssetUrl("icons/monster-fit-192.png"),
            badge: appAssetUrl("icons/monster-fit-192.png"),
            tag: `monster-fit-${key}`,
          });
        } else {
          new Notification("Monster Fit · seu treino de hoje", { body: `${workout.title} está na sua agenda. Comece no seu ritmo.`, icon: appAssetUrl("icons/monster-fit-192.png") });
        }
        if (mounted) localStorage.setItem(key, new Date().toISOString());
      } catch {
        /* Permissão ou APIs indisponíveis não interrompem o restante do app. */
      }
    })();
    return () => { mounted = false; };
  }, [account?.id, data?.history, data?.schedule, data?.settings.notifications, data?.workouts]);

  const currentWorkout = useMemo(() => data?.workouts.find((workout) => workout.id === editingId) ?? null, [data?.workouts, editingId]);
  const searchResults = useMemo(() => {
    if (!data || !searchValue.trim()) return [];
    const term = searchValue.trim().toLocaleLowerCase("pt-BR");
    return [...EXERCISE_CATALOG, ...data.customExercises].filter((exercise) => `${exercise.name} ${exercise.muscle} ${exercise.equipment} ${exercise.purpose ?? ""} ${exercise.description} ${(exercise.primaryMuscles ?? []).join(" ")} ${(exercise.secondaryMuscles ?? []).join(" ")}`.toLocaleLowerCase("pt-BR").includes(term)).slice(0, 6);
  }, [data, searchValue]);

  function createWorkout() {
    if (!account) return;
    const now = new Date().toISOString();
    const workout: Workout = { id: makeId("workout"), title: "Novo treino", description: "", days: [], color: WORKOUT_COLORS[(data?.workouts.length ?? 0) % WORKOUT_COLORS.length], exercises: [], createdAt: now, updatedAt: now };
    updateData((current) => ({ ...current, workouts: [...current.workouts, workout] }));
    setEditingId(workout.id); setPage("editor");
  }
  function updateWorkout(next: Workout) {
    updateData((current) => updateWorkoutSchedule(current, next));
  }
  function duplicateWorkout(workout: Workout) {
    const copy = createWorkoutCopy(workout);
    updateData((current) => ({ ...current, workouts: [...current.workouts, copy] }));
    toast.success("Uma cópia independente foi criada.");
  }
  function confirmDeleteWorkout() {
    if (!deleteTarget) return;
    const id = deleteTarget.id;
    updateData((current) => ({ ...current, workouts: current.workouts.filter((item) => item.id !== id), schedule: Object.fromEntries(Object.entries(current.schedule).map(([day, assigned]) => [day, assigned === id ? null : assigned])) as BellaData["schedule"], activeWorkout: current.activeWorkout?.workoutId === id ? null : current.activeWorkout }));
    if (editingId === id) { setEditingId(""); setPage("workouts"); }
    toast.success("Treino excluído."); setDeleteTarget(null);
  }
  function startWorkout(workout: Workout) {
    if (!workout.exercises.length) { toast.error("Adicione pelo menos um exercício antes de iniciar."); return; }
    if (data?.activeWorkout && data.activeWorkout.workoutId !== workout.id) { setAbandonPrompt(workout); return; }
    const existing = data?.activeWorkout?.workoutId === workout.id ? data.activeWorkout : null;
    const active: ActiveWorkout = existing ? resumeActiveWorkout(existing) : createActiveWorkout(workout.id);
    updateData((current) => ({ ...current, activeWorkout: active })); setPage("runner");
  }
  function forceStartWorkout(workout: Workout) {
    const active: ActiveWorkout = createActiveWorkout(workout.id);
    updateData((current) => ({ ...current, activeWorkout: active })); setAbandonPrompt(null); setPage("runner");
  }
  function finishWorkout(performed: PerformedSet[], startedAt: string, durationSeconds: number) {
    const workout = data?.workouts.find((item) => item.id === data.activeWorkout?.workoutId);
    if (!workout || !account) { updateData((current) => ({ ...current, activeWorkout: null })); setPage("home"); return; }
    const finishedAt = new Date().toISOString();
    const unitFactor = data?.settings.weightUnit === "lb" ? 0.45359237 : 1;
    const volumeKg = performed.reduce((sum, set) => sum + (Number(set.weight) || 0) * (Number(set.reps) || 0), 0) * unitFactor;
    const record = { id: makeId("session"), workoutId: workout.id, title: workout.title, startedAt, finishedAt, durationSeconds: Math.max(0, durationSeconds), performed, volumeKg, weightUnit: data?.settings.weightUnit ?? "kg" };
    updateData((current) => ({ ...current, activeWorkout: null, history: [record, ...current.history] }));
    setPage("history");
    toast.success("Treino concluído! Seus dados foram salvos no histórico.", { duration: 4500 });
  }
  function favorite(id: string) {
    updateData((current) => ({ ...current, favorites: current.favorites.includes(id) ? current.favorites.filter((item) => item !== id) : [...current.favorites, id] }));
  }
  function addExerciseToWorkout(exercise: ExerciseDefinition, workoutId?: string) {
    if (!workoutId) return;
    updateData((current) => ({ ...current, workouts: current.workouts.map((workout) => workout.id === workoutId ? appendExerciseToWorkout(workout, exercise) : workout) }));
  }
  function saveExercise(exercise: ExerciseDefinition) {
    updateData((current) => current.customExercises.some((item) => item.id === exercise.id)
      ? { ...current, customExercises: current.customExercises.map((item) => item.id === exercise.id ? exercise : item) }
      : { ...current, exerciseOverrides: { ...current.exerciseOverrides, [exercise.id]: exercise } });
    toast.success("Exercício atualizado.");
  }
  function deleteExercise(exercise: ExerciseDefinition) {
    updateData((current) => ({
      ...current,
      customExercises: current.customExercises.filter((item) => item.id !== exercise.id),
      hiddenExerciseIds: current.hiddenExerciseIds.includes(exercise.id) ? current.hiddenExerciseIds : [...current.hiddenExerciseIds, exercise.id],
      favorites: current.favorites.filter((id) => id !== exercise.id),
      workouts: current.workouts.map((workout) => ({ ...workout, exercises: workout.exercises.filter((item) => item.id !== exercise.id) })),
    }));
    toast.success("Exercício apagado.");
  }
  function saveTafExercise(id: string, override: TafExerciseOverride) {
    updateData((current) => ({ ...current, tafExerciseOverrides: { ...current.tafExerciseOverrides, [id]: override } }));
    toast.success("Modalidade TAF atualizada.");
  }
  function deleteTafExercise(id: string) {
    updateData((current) => ({ ...current, hiddenExerciseIds: current.hiddenExerciseIds.includes(id) ? current.hiddenExerciseIds : [...current.hiddenExerciseIds, id], tafAttempts: current.tafAttempts.filter((attempt) => attempt.exerciseId !== id) }));
    toast.success("Modalidade TAF apagada.");
  }
  function importData(next: BellaData) {
    if (!account || !validateBackup({ format: "monster-fit-backup", version: 1, exportedAt: "", user: { name: "", email: "" }, data: next })) { toast.error("Este arquivo de backup não pôde ser validado."); return; }
    updateData(() => ({ ...next, profile: { ...next.profile, email: account.email }, activeWorkout: null, tafAttempts: next.tafAttempts ?? [], customTafExercises: next.customTafExercises ?? [] })); toast.success("Backup restaurado no perfil local.");
  }
  function resetData() {
    if (!account) return;
    updateData(() => createInitialData(account.name, account.email));
    toast.success("Seus dados foram limpos. A conta local continua ativa.");
  }
  function setSchedule(day: DayKey, workoutId: string | null) {
    updateData((current) => assignScheduledWorkout(current, day, workoutId));
  }
  function addTafAttempt(attempt: TafAttempt) {
    updateData((current) => ({ ...current, tafAttempts: appendTafAttempt(current.tafAttempts, attempt) }));
  }
  function addCustomTafExercise(exercise: CustomTafExercise) {
    updateData((current) => current.customTafExercises.some((item) => item.id === exercise.id) ? current : { ...current, customTafExercises: [...current.customTafExercises, exercise] });
  }
  function pickSearchResult(exercise: ExerciseDefinition) {
    setSearchValue(""); setPage("library");
    window.setTimeout(() => window.dispatchEvent(new CustomEvent("monster-fit:select-exercise", { detail: exercise.id })), 80);
  }

  if (!account || !data) return <><AuthScreen auth={auth} /><div id="pwa-auth-install-anchor"/><OwnerFooter /></>;
  const searchIsOpen = searchValue.trim().length > 0;
  const activeWorkout = data.workouts.find((workout) => workout.id === data.activeWorkout?.workoutId) ?? null;
  let pageContent;
  if (page === "runner" && activeWorkout) pageContent = <WorkoutRunner workout={activeWorkout} data={data} onUpdate={(active) => updateData((current) => ({ ...current, activeWorkout: active }))} onResume={() => updateData((current) => current.activeWorkout ? { ...current, activeWorkout: resumeActiveWorkout(current.activeWorkout) } : current)} onFinish={finishWorkout} onExit={() => { setPage("workouts"); }} />;
  else if (page === "home") pageContent = <Dashboard data={data} onNavigate={setPage} onStart={startWorkout} onCreate={createWorkout} />;
  else if (page === "workouts") pageContent = <WorkoutsPage data={data} onCreate={createWorkout} onEdit={(workout) => { setEditingId(workout.id); setPage("editor"); }} onDuplicate={duplicateWorkout} onDelete={setDeleteTarget} onStart={startWorkout} />;
  else if (page === "editor" && currentWorkout) pageContent = <WorkoutEditor key={currentWorkout.id} workout={currentWorkout} data={data} onChange={updateWorkout} onBack={() => setPage("workouts")} onFavorite={favorite} />;
  else if (page === "library") pageContent = <ExerciseLibraryPage data={data} accountId={account.id} onFavorite={favorite} workouts={data.workouts} onAddToWorkout={addExerciseToWorkout} onCreateWorkout={createWorkout} onSaveExercise={saveExercise} onDeleteExercise={deleteExercise} />;
  else if (page === "taf") pageContent = <TafPage data={data} accountId={account.id} onSave={addTafAttempt} onCreate={addCustomTafExercise} onSaveExercise={saveTafExercise} onDeleteExercise={deleteTafExercise} />;
  else if (page === "coach") pageContent = <CoachPage data={data} accountId={account.id} />;
  else if (page === "favorites") pageContent = <FavoritesPage data={data} onFavorite={favorite} />;
  else if (page === "history") pageContent = <HistoryPage data={data} />;
  else if (page === "calendar") pageContent = <CalendarPage data={data} onAssign={setSchedule} />;
  else if (page === "evolution") pageContent = <EvolutionPage data={data} />;
  else if (page === "profile") pageContent = <ProfilePage data={data} onUpdate={(profile) => updateData((current) => ({ ...current, profile }))} />;
  else if (page === "settings") pageContent = <SettingsPage account={account} data={data} onUpdateSettings={(settings) => updateData((current) => ({ ...current, settings }))} onImport={importData} onReset={resetData} onLogout={auth.logout} onDeleteAccount={auth.deleteAccount} />;
  else pageContent = <Dashboard data={data} onNavigate={setPage} onStart={startWorkout} onCreate={createWorkout} />;

  return <>
    <AppShell active={page} onNavigate={setPage} name={data.profile.name || account.name} email={account.email} onLogout={auth.logout} onNewWorkout={createWorkout} searchValue={searchValue} onSearch={setSearchValue} searchOpen={searchIsOpen} searchResults={searchResults} onSelectSearch={pickSearchResult}>
      {storageError && <div className="storage-warning" role="alert"><AlertTriangle size={17}/>{storageError}</div>}
      {pageContent}
    </AppShell>
    <OwnerFooter />
    <Modal open={!!deleteTarget} title={`Excluir ${deleteTarget?.title || "este treino"}?`} eyebrow="ESSA AÇÃO NÃO PODE SER DESFEITA" onClose={() => setDeleteTarget(null)}><p className="confirm-copy">O treino será removido e qualquer dia da agenda associado a ele ficará livre. O histórico de sessões já concluídas será mantido.</p><div className="modal-actions"><Button variant="outline" onClick={() => setDeleteTarget(null)}>CANCELAR</Button><Button variant="danger" onClick={confirmDeleteWorkout}>SIM, EXCLUIR</Button></div></Modal>
    <Modal open={!!abandonPrompt} title="Trocar de treino?" eyebrow="TREINO EM ANDAMENTO" onClose={() => setAbandonPrompt(null)}><p className="confirm-copy">Há uma sessão ainda não concluída. Se preferir, retome a série e o descanso salvos. Iniciar <strong>{abandonPrompt?.title}</strong> descartará as séries concluídas na sessão atual.</p><div className="modal-actions"><Button variant="outline" onClick={() => { setAbandonPrompt(null); setPage("runner"); }}>RETOMAR TREINO ATUAL</Button><Button variant="danger" onClick={() => abandonPrompt && forceStartWorkout(abandonPrompt)}>DESCARTAR E INICIAR</Button></div></Modal>
    {!isInstalled && <InstallHint />}
  </>;
}
function InstallHint(){
  const [installEvent,setInstallEvent]=useState<Event|null>(null);
  useEffect(()=>{const handle=(event:Event)=>{event.preventDefault();setInstallEvent(event);};window.addEventListener("beforeinstallprompt",handle);return()=>window.removeEventListener("beforeinstallprompt",handle);},[]);
  if(!installEvent)return null;
  return <div className="install-hint"><span><span className="brand-mark">M</span><span><strong>Leve o MONSTER FIT com você.</strong><small>Instale o app para acessar seus treinos rapidamente.</small></span></span><button type="button" onClick={async()=>{const prompt=installEvent as Event&{prompt:()=>Promise<void>;userChoice:Promise<{outcome:string}>};await prompt.prompt();const result=await prompt.userChoice;if(result.outcome==="accepted")window.dispatchEvent(new Event("appinstalled"));setInstallEvent(null);}}>INSTALAR</button><button type="button" className="install-dismiss" onClick={()=>setInstallEvent(null)} aria-label="Fechar aviso">×</button></div>;
}
