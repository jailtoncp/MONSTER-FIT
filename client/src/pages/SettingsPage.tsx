import { useRef, useState } from "react";
import { Bell, Check, Download, FileJson2, Moon, RotateCcw, ShieldCheck, Sun, Trash2, Upload, Volume2, Vibrate, Weight } from "lucide-react";
import type { Account, BellaData, Settings as SettingsType } from "../types";
import { makeBackup, validateBackup } from "../lib/storageService";
import { Button, Card, Field, Modal, PageHeading } from "../components/common";

export default function SettingsPage({ account, data, onUpdateSettings, onImport, onReset, onLogout, onDeleteAccount }: {
  account: Account;
  data: BellaData;
  onUpdateSettings: (settings: SettingsType) => void;
  onImport: (next: BellaData) => void;
  onReset: () => void;
  onLogout: () => void;
  onDeleteAccount: () => void;
}) {
  const [confirm, setConfirm] = useState<"import" | "reset" | "delete" | null>(null);
  const [pendingImport, setPendingImport] = useState<BellaData | null>(null);
  const [importError, setImportError] = useState("");
  const [notice, setNotice] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  function update<K extends keyof SettingsType>(key: K, value: SettingsType[K]) {
    onUpdateSettings({ ...data.settings, [key]: value });
  }

  function exportFile() {
    const blob = new Blob([JSON.stringify(makeBackup(account, data), null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `monster-fit-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setNotice("Backup exportado com sucesso.");
    window.setTimeout(() => setNotice(""), 3200);
  }

  async function pickImport(file?: File) {
    if (!file) return;
    setImportError("");
    try {
      const parsed: unknown = JSON.parse(await file.text());
      if (!validateBackup(parsed)) throw new Error("O arquivo não tem o formato de backup Monster Fit ou está incompleto.");
      setPendingImport(parsed.data);
      setConfirm("import");
    } catch (reason) {
      setImportError(reason instanceof Error ? reason.message : "Não foi possível ler este arquivo.");
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function requestNotifications(enabled: boolean) {
    if (!enabled) {
      update("notifications", false);
      return;
    }
    if (!("Notification" in window)) {
      setNotice("Este navegador não oferece suporte a notificações.");
      return;
    }
    const permission = await Notification.requestPermission();
    if (permission === "granted") update("notifications", true);
    else {
      update("notifications", false);
      setNotice(permission === "denied" ? "As notificações foram bloqueadas nas permissões do navegador." : "Permissão para notificações não concedida.");
    }
  }

  function confirmAction() {
    if (confirm === "import" && pendingImport) onImport(pendingImport);
    if (confirm === "reset") onReset();
    if (confirm === "delete") onDeleteAccount();
    setConfirm(null);
    setPendingImport(null);
  }

  return <div className="page">
    <PageHeading eyebrow="SUA EXPERIÊNCIA, SUAS REGRAS" title="Configurações" description="Ajuste o Monster Fit para combinar com a sua rotina." />
    <div className="settings-layout"><div className="settings-sections">
      <Card className="settings-card"><div className="settings-heading"><span className="settings-icon"><Sun size={17} /></span><div><div className="eyebrow">APARÊNCIA</div><h3>Como você prefere ver</h3></div></div><div className="setting-row"><div className="setting-row-copy"><strong>Tema</strong><small>Escolha uma aparência confortável para você.</small></div><div className="theme-switch"><button className={data.settings.theme === "light" ? "chosen" : ""} onClick={() => update("theme", "light")}><Sun size={15} /> Claro</button><button className={data.settings.theme === "dark" ? "chosen" : ""} onClick={() => update("theme", "dark")}><Moon size={15} /> Escuro</button></div></div></Card>

      <Card className="settings-card"><div className="settings-heading"><span className="settings-icon"><ClockIcon /></span><div><div className="eyebrow">MODO TREINO</div><h3>Durante seu treino</h3></div></div>
        <div className="setting-row"><div className="setting-row-copy"><strong>Descanso padrão</strong><small>Usado ao adicionar novos exercícios.</small></div><Field label="SEGUNDOS"><select value={data.settings.restSeconds} onChange={(event) => update("restSeconds", Number(event.target.value))}>{[30, 45, 60, 75, 90, 120, 150, 180].map((n) => <option key={n} value={n}>{n} segundos</option>)}</select></Field></div>
        <div className="setting-row"><div className="setting-row-copy"><strong>Unidade de peso</strong><small>Exibida no editor, execução e histórico.</small></div><div className="theme-switch"><button className={data.settings.weightUnit === "kg" ? "chosen" : ""} onClick={() => update("weightUnit", "kg")}><Weight size={14} /> kg</button><button className={data.settings.weightUnit === "lb" ? "chosen" : ""} onClick={() => update("weightUnit", "lb")}><Weight size={14} /> lb</button></div></div>
        <div className="setting-row"><div className="setting-row-copy"><strong>Sons do timer</strong><small>Um aviso discreto ao fim do descanso.</small></div><Toggle checked={data.settings.sound} onChange={(value) => update("sound", value)} label="Som" icon={<Volume2 size={15} />} /></div>
        <div className="setting-row"><div className="setting-row-copy"><strong>Vibração</strong><small>Quando disponível no seu dispositivo.</small></div><Toggle checked={data.settings.vibration} onChange={(value) => update("vibration", value)} label="Vibração" icon={<Vibrate size={15} />} /></div>
        <div className="setting-row"><div className="setting-row-copy"><strong>Lembrete diário</strong><small>Ao abrir o app, avisa uma vez se há treino hoje e você ainda não concluiu uma sessão.</small></div><Toggle checked={data.settings.notifications} onChange={requestNotifications} label="Lembrete diário" icon={<Bell size={15} />} /></div>
      </Card>

      <Card className="settings-card"><div className="settings-heading"><span className="settings-icon"><FileJson2 size={17} /></span><div><div className="eyebrow">SEUS DADOS, COM VOCÊ</div><h3>Backup e restauração</h3></div></div><p className="settings-description">Exporte um arquivo JSON para guardar seus treinos ou restaurá-los em outro momento. O Monster Fit não envia esses dados para um servidor.</p>{notice && <div className="form-message success-message" role="status"><Check size={14} />{notice}</div>}{importError && <div className="form-message error-message" role="alert">{importError}</div>}<div className="backup-actions"><Button onClick={exportFile}><Download size={16} /> EXPORTAR MEUS DADOS</Button><Button variant="outline" onClick={() => fileRef.current?.click()}><Upload size={16} /> IMPORTAR BACKUP</Button><input ref={fileRef} className="sr-only" type="file" accept=".json,application/json" onChange={(event) => pickImport(event.target.files?.[0])} /></div></Card>

      <Card className="settings-card privacy-card"><span className="privacy-icon"><ShieldCheck size={18} /></span><div><div className="eyebrow">PRIVACIDADE LOCAL</div><h3>Seus dados ficam com você.</h3><p>Contas, treinos e histórico ficam no armazenamento deste navegador. Faça backups regulares: limpar os dados do navegador também pode apagá-los.</p><small>Conta ativa: {account.email}</small></div></Card>

      <Card className="settings-card danger-zone"><div className="settings-heading"><span className="settings-icon danger-icon"><Trash2 size={17} /></span><div><div className="eyebrow">AÇÕES DE CONTA</div><h3>Começar de novo</h3></div></div><p className="settings-description">Você pode sair da conta, apagar os treinos e histórico deste perfil ou remover a conta local deste dispositivo.</p><div className="danger-actions"><Button variant="outline" onClick={onLogout}>SAIR DA CONTA</Button><Button variant="danger" onClick={() => setConfirm("reset")}><RotateCcw size={15} /> LIMPAR MEUS DADOS</Button><Button variant="danger" onClick={() => setConfirm("delete")}><Trash2 size={15} /> EXCLUIR CONTA LOCAL</Button></div></Card>
    </div></div>

    <Modal open={!!confirm} title={confirm === "import" ? "Restaurar este backup?" : confirm === "reset" ? "Limpar seus dados?" : "Excluir sua conta local?"} eyebrow="CONFIRME ESTA AÇÃO" onClose={() => { setConfirm(null); setPendingImport(null); }}>
      <div className="confirm-copy"><p>{confirm === "import" ? `Isso substituirá os dados de treino do perfil atual pelo backup de ${pendingImport?.profile.name || "Monster Fit"}. Essa ação não pode ser desfeita sem outro backup.` : confirm === "reset" ? "Seus treinos, perfil preenchido, exercícios pessoais, favoritos e histórico serão apagados. A conta local continuará existindo." : "Sua conta local, senha, perfil e todos os dados deste dispositivo serão removidos permanentemente."}</p>{confirm === "reset" && <small>Exporte um backup antes se deseja guardar seus dados.</small>}</div>
      <div className="modal-actions"><Button variant="outline" onClick={() => { setConfirm(null); setPendingImport(null); }}>CANCELAR</Button><Button variant="danger" onClick={confirmAction}>{confirm === "import" ? "RESTAURAR BACKUP" : confirm === "reset" ? "SIM, LIMPAR DADOS" : "SIM, EXCLUIR CONTA"}</Button></div>
    </Modal>
  </div>;
}

function Toggle({ checked, onChange, label, icon }: { checked: boolean; onChange: (value: boolean) => void | Promise<void>; label: string; icon: React.ReactNode }) {
  return <button type="button" className={`toggle-control ${checked ? "on" : ""}`} role="switch" aria-checked={checked} aria-label={label} onClick={() => onChange(!checked)}><span>{icon}</span><i /></button>;
}

function ClockIcon() { return <span style={{ fontWeight: 700 }}>◷</span>; }
