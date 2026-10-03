import { useState } from "react";
import { ArrowRight, Check, Dumbbell, Sparkles, Zap } from "lucide-react";
import { Button, Field } from "./common";
import type { Account } from "../types";
import { HERO_IMAGE_URL } from "../lib/assetPaths";

type AuthApi = { login: (email: string, password: string) => Promise<void>; register: (name: string, email: string, password: string) => Promise<void>; resetPassword: (email: string, password: string) => Promise<void> };

export default function AuthScreen({ auth }: { auth: AuthApi }) {
  const [mode, setMode] = useState<"login" | "register" | "recover">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault(); setError(""); setMessage(""); setBusy(true);
    try {
      if (mode === "login") await auth.login(email, password);
      if (mode === "register") await auth.register(name, email, password);
      if (mode === "recover") { await auth.resetPassword(email, newPassword); setMessage("Senha atualizada. Entre com a nova senha."); setMode("login"); }
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Não foi possível continuar."); }
    finally { setBusy(false); }
  }

  const title = mode === "login" ? "Seu próximo treino começa aqui." : mode === "register" ? "Um espaço só seu, para evoluir." : "Vamos recuperar seu acesso.";
  const subtitle = mode === "login" ? "Entre no seu ritmo e acompanhe cada conquista." : mode === "register" ? "Crie sua conta local e comece sua jornada." : "Redefina sua senha neste dispositivo.";

  return <main className="auth-shell">
    <section className="auth-visual" aria-label="MONSTER FIT">
      <div className="auth-visual-image" style={{ backgroundImage: `url("${HERO_IMAGE_URL}")` }} />
      <div className="auth-brand"><span className="brand-mark"><Zap size={19} fill="currentColor" /></span><span>MONSTER <i>FIT</i></span></div>
      <div className="auth-copy"><span className="auth-overline"><Sparkles size={14} /> SUA FORÇA, SEU RITMO</span><h1>Treino.<br /><em>Força.</em><br />Evolução.</h1><p>Uma rotina construída para sua meta — um treino de cada vez.</p><div className="auth-proof"><span><Dumbbell size={17} /></span><div><strong>Evolução que acompanha você</strong><small>Seus dados ficam salvos neste dispositivo.</small></div></div></div>
      <div className="auth-bottom-note">TREINE FORTE · EVOLUA SEM ATALHOS</div>
    </section>
    <section className="auth-panel">
      <div className="auth-mobile-brand"><span className="brand-mark"><Zap size={18} fill="currentColor" /></span><span>MONSTER <i>FIT</i></span></div>
      <div className="auth-form-wrap">
        <div className="eyebrow">BEM-VINDO AO MONSTER FIT</div>
        <h2>{title}</h2><p className="auth-lede">{subtitle}</p>
        <form onSubmit={submit} className="auth-form">
          {mode === "register" && <Field label="Seu nome"><input autoComplete="name" required value={name} onChange={(event) => setName(event.target.value)} placeholder="Como podemos te chamar?" /></Field>}
          <Field label="E-mail"><input type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="voce@email.com" /></Field>
          {mode !== "recover" && <Field label="Senha"><input type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} required minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Mínimo de 8 caracteres" /></Field>}
          {mode === "recover" && <Field label="Nova senha"><input type="password" autoComplete="new-password" required minLength={8} value={newPassword} onChange={(event) => setNewPassword(event.target.value)} placeholder="Mínimo de 8 caracteres" /></Field>}
          {error && <div className="form-message error-message" role="alert">{error}</div>}
          {message && <div className="form-message success-message"><Check size={16} />{message}</div>}
          <Button type="submit" size="lg" className="auth-submit" disabled={busy}>{busy ? "AGUARDE…" : mode === "login" ? "ENTRAR" : mode === "register" ? "CRIAR MINHA CONTA" : "ATUALIZAR SENHA"}<ArrowRight size={17} /></Button>
        </form>
        <div className="auth-links">
          {mode === "login" ? <><button type="button" onClick={() => { setMode("recover"); setError(""); }}>Esqueci minha senha</button><span>AINDA NÃO FAZ PARTE?</span><button type="button" className="auth-register-link" onClick={() => { setMode("register"); setError(""); }}>Criar conta <ArrowRight size={14} /></button></> : <button type="button" onClick={() => { setMode("login"); setError(""); }}>← Voltar para entrar</button>}
        </div>
        <div className="local-data-note"><span className="local-dot" /> Seus dados são salvos localmente neste dispositivo.</div>
      </div>
      <footer className="auth-footer">MONSTER FIT <span>·</span> TREINO. FORÇA. EVOLUÇÃO.</footer>
    </section>
  </main>;
}
