import type { ReactNode } from "react";
import { useState } from "react";
import { Activity, CalendarDays, ChartNoAxesColumnIncreasing, ChevronDown, CircleHelp, ClipboardList, Dumbbell, Heart, History, House, LogOut, Menu, MessageCircleHeart, Plus, Search, Settings, UserRound, X, Zap } from "lucide-react";
import type { ExerciseDefinition, PageId } from "../types";

const items: Array<{ id: PageId; label: string; icon: typeof House; mobile?: boolean }> = [
  { id: "home", label: "Início", icon: House, mobile: true },
  { id: "workouts", label: "Meus treinos", icon: Dumbbell, mobile: true },
  { id: "library", label: "Exercícios", icon: Activity, mobile: true },
  { id: "taf", label: "TAF", icon: ClipboardList, mobile: true },
  { id: "coach", label: "Monster Coach", icon: MessageCircleHeart, mobile: true },
  { id: "evolution", label: "Evolução", icon: ChartNoAxesColumnIncreasing, mobile: true },
  { id: "calendar", label: "Calendário", icon: CalendarDays },
  { id: "history", label: "Histórico", icon: History },
  { id: "favorites", label: "Favoritos", icon: Heart },
  { id: "profile", label: "Meu perfil", icon: UserRound },
  { id: "settings", label: "Configurações", icon: Settings },
];

export default function AppShell({ active, onNavigate, name, email, onLogout, onNewWorkout, onSearch, searchValue, searchOpen, searchResults = [], onSelectSearch, children }: {
  active: PageId; onNavigate: (page: PageId) => void; name: string; email: string; onLogout: () => void; onNewWorkout: () => void;
  onSearch: (value: string) => void; searchValue: string; searchOpen: boolean; searchResults?: ExerciseDefinition[]; onSelectSearch?: (exercise: ExerciseDefinition) => void; children: ReactNode;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const nav = (mobile = false) => items.filter((item) => !mobile || item.mobile).map(({ id, label, icon: Icon }) => <button key={id} className={`nav-item ${active === id || (id === "workouts" && active === "editor") ? "active" : ""}`} onClick={() => { onNavigate(id); setMenuOpen(false); }} type="button" aria-current={active === id ? "page" : undefined}>
    <Icon size={18} strokeWidth={active === id ? 2.1 : 1.75} /><span>{label}</span>{id === "workouts" && <ChevronDown className="nav-chevron" size={14} />}
  </button>);

  return <div className="app-shell">
    <aside className={`sidebar ${menuOpen ? "sidebar-open" : ""}`}>
      <a className="brand-lockup" href="#inicio" onClick={(e) => { e.preventDefault(); onNavigate("home"); }}><span className="brand-mark"><Zap size={16} fill="currentColor" /></span><span>MONSTER <i>FIT</i></span></a>
      <div className="side-label">MENU PRINCIPAL</div>
      <nav className="side-nav">{nav()}</nav>
      <button type="button" className="side-workout-cta" onClick={onNewWorkout}><span><Plus size={17} /></span><span><strong>Criar treino</strong><small>Monte sua próxima rotina</small></span></button>
      <div className="side-spacer" />
      <div className="sidebar-note"><span className="note-icon"><CircleHelp size={16} /></span><div><strong>Precisa de inspiração?</strong><small>Pequenos passos também contam.</small></div></div>
      <button className="user-chip" type="button" onClick={() => onNavigate("profile")}><span className="user-avatar">{name.slice(0, 1).toUpperCase()}</span><span className="user-info"><strong>{name || "Minha conta"}</strong><small>{email}</small></span><ChevronDown size={15} /></button>
    </aside>
    <div className="workspace">
      <header className="topbar">
        <button type="button" className="mobile-menu-button icon-button" aria-label={menuOpen ? "Fechar menu" : "Abrir menu"} onClick={() => setMenuOpen((open) => !open)}>{menuOpen ? <X size={20} /> : <Menu size={20} />}</button>
        <div className="mobile-brand"><span className="brand-mark"><Zap size={15} fill="currentColor" /></span><span>MONSTER <i>FIT</i></span></div>
        <div className="topbar-path"><span>Área de treino</span><span className="path-divider">/</span><strong>{items.find((item) => item.id === active)?.label ?? (active === "runner" ? "Treino em andamento" : "Editor de treino")}</strong></div>
        <div className="topbar-actions">
          <div className="search-anchor"><label className={`global-search ${searchOpen ? "search-active" : ""}`}><Search size={16} /><input value={searchValue} onChange={(event) => onSearch(event.target.value)} onFocus={() => onSearch(searchValue)} placeholder="Buscar exercícios" aria-label="Buscar exercícios" /><kbd>⌘ K</kbd></label>
            {searchOpen && <div className="search-popover">{searchResults.length ? <>{searchResults.map((exercise) => <button type="button" key={exercise.id} className="search-result" onMouseDown={(event)=>event.preventDefault()} onClick={()=>onSelectSearch?.(exercise)}><span className="search-result-icon"><Dumbbell size={16}/></span><span><strong>{exercise.name}</strong><small>{exercise.muscle} · {exercise.equipment}</small></span><Plus size={14}/></button>)}<div className="search-popover-footer">RESULTADOS DA BIBLIOTECA MONSTER FIT</div></> : <div className="search-no-results">{searchValue.trim()?"Nenhum exercício encontrado.":"Digite um nome ou grupo muscular."}</div>}</div>}
          </div>
          <button type="button" className="topbar-avatar" onClick={() => onNavigate("profile")} aria-label={`Perfil de ${name}`}>{name.slice(0, 1).toUpperCase()}</button>
          <button type="button" title="Sair da conta" className="topbar-logout icon-button" onClick={onLogout} aria-label="Sair da conta"><LogOut size={17} /></button>
        </div>
      </header>
      <main className="main-content" onClick={() => { if (menuOpen) setMenuOpen(false); }}>{children}</main>
      <nav className="mobile-nav" aria-label="Navegação principal">{nav(true)}</nav>
      <button className="mobile-fab" type="button" aria-label="Criar treino" onClick={onNewWorkout}><Plus size={23} /></button>
    </div>
    {menuOpen && <button className="mobile-scrim" type="button" aria-label="Fechar menu" onClick={() => setMenuOpen(false)} />}
  </div>;
}
