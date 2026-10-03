import { useEffect, useRef, useState } from "react";
import { Dumbbell, Mic, MicOff, Send, Sparkles, Volume2, VolumeX } from "lucide-react";
import type { BellaData } from "../types";
import { Button, Card, PageHeading } from "../components/common";
import { COACH_SUGGESTIONS, coachGreeting, getCoachReply, workoutSummary } from "../lib/coachService";

type Message = { id: string; role: "coach" | "user"; text: string };
type SpeechRecognitionLike = { lang: string; interimResults: boolean; continuous: boolean; start: () => void; stop: () => void; onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null; onend: (() => void) | null; onerror: (() => void) | null };
type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;
declare global { interface Window { SpeechRecognition?: SpeechRecognitionConstructor; webkitSpeechRecognition?: SpeechRecognitionConstructor; } }

function historyKey(accountId: string) { return `monster-fit:coach-chat:v1:${accountId}`; }
function makeId() { return globalThis.crypto?.randomUUID?.() ?? `coach-${Date.now()}-${Math.random().toString(36).slice(2)}`; }

export default function CoachPage({ data, accountId }: { data: BellaData; accountId: string }) {
  const [messages, setMessages] = useState<Message[]>(() => {
    try { const saved = JSON.parse(localStorage.getItem(historyKey(accountId)) ?? "null") as Message[] | null; return saved?.length ? saved : [{ id: makeId(), role: "coach", text: coachGreeting(data) }]; } catch { return [{ id: makeId(), role: "coach", text: coachGreeting(data) }]; }
  });
  const [question, setQuestion] = useState("");
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { localStorage.setItem(historyKey(accountId), JSON.stringify(messages.slice(-40))); endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [accountId, messages]);
  useEffect(() => () => { recognitionRef.current?.stop(); window.speechSynthesis?.cancel(); }, []);

  function ask(value = question) {
    const clean = value.trim();
    if (!clean) return;
    const answer = getCoachReply(clean, data);
    setMessages((current) => [...current, { id: makeId(), role: "user", text: clean }, { id: makeId(), role: "coach", text: answer }]);
    setQuestion("");
  }
  function speak(message: Message) {
    if (!("speechSynthesis" in window)) return;
    if (speakingId === message.id) { window.speechSynthesis.cancel(); setSpeakingId(null); return; }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(message.text.replaceAll("**", ""));
    utterance.lang = "pt-BR"; utterance.rate = 0.96; utterance.pitch = 1.04;
    utterance.onend = () => setSpeakingId(null); utterance.onerror = () => setSpeakingId(null);
    setSpeakingId(message.id); window.speechSynthesis.speak(utterance);
  }
  function toggleListening() {
    const Constructor = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!Constructor) { setQuestion("Seu navegador não oferece ditado por voz. Você pode digitar sua pergunta."); return; }
    if (listening) { recognitionRef.current?.stop(); setListening(false); return; }
    const recognition = new Constructor(); recognition.lang = "pt-BR"; recognition.interimResults = false; recognition.continuous = false;
    recognition.onresult = (event) => { const transcript = Array.from(event.results).map((result) => result[0]?.transcript ?? "").join(" "); setQuestion((current) => `${current} ${transcript}`.trim()); };
    recognition.onend = () => setListening(false); recognition.onerror = () => setListening(false);
    recognitionRef.current = recognition; setListening(true); recognition.start();
  }
  const firstWorkout = data.workouts.find((workout) => workout.exercises.length);
  return <div className="page coach-page">
    <PageHeading eyebrow="SEU PARCEIRO DE TREINO" title={<>Conheça o <em>Monster Coach</em>.</>} description="Um assistente pessoal para tirar dúvidas sobre execução, rotina, descanso e evolução." actions={<div className="coach-status"><span className="coach-status-dot" /> GUIA LOCAL · PRIVACIDADE EM PRIMEIRO LUGAR</div>} />
    <div className="coach-layout">
      <aside className="coach-aside">
        <Card className="coach-identity"><div className="coach-orb"><Sparkles size={26} /></div><span className="eyebrow">MONSTER COACH</span><h2>Treino com mais clareza.</h2><p>Respostas contextualizadas com seu objetivo, seus treinos e o que você já registrou.</p><div className="coach-safety"><Dumbbell size={15} /><span>Não substitui um profissional de saúde ou educação física.</span></div></Card>
        <Card className="coach-context"><span className="eyebrow">SEU CONTEXTO</span><strong>{data.profile.goal}</strong><span>{data.workouts.length} rotina{data.workouts.length === 1 ? "" : "s"} criada{data.workouts.length === 1 ? "" : "s"}</span><span>{data.history.length} sessão{data.history.length === 1 ? "" : "ões"} registrada{data.history.length === 1 ? "" : "s"}</span>{firstWorkout && <small>{workoutSummary(firstWorkout)}</small>}</Card>
      </aside>
      <Card className="coach-chat-card"><div className="coach-chat-header"><div><span className="eyebrow">CONVERSA DE TREINO</span><h2>O que você quer descobrir?</h2></div><button type="button" className="coach-clear" onClick={() => setMessages([{ id: makeId(), role: "coach", text: coachGreeting(data) }])}>LIMPAR</button></div><div className="coach-messages" aria-live="polite">{messages.map((message) => <div className={`coach-message-row ${message.role}`} key={message.id}><div className="coach-avatar">{message.role === "coach" ? <Sparkles size={15} /> : data.profile.name.slice(0, 1).toUpperCase()}</div><div className="coach-message"><p>{message.text}</p>{message.role === "coach" && <button type="button" className="coach-speak" onClick={() => speak(message)} aria-label={speakingId === message.id ? "Parar leitura" : "Ouvir resposta"}>{speakingId === message.id ? <VolumeX size={14} /> : <Volume2 size={14} />} {speakingId === message.id ? "PARAR" : "OUVIR"}</button>}</div></div>)}<div ref={endRef} /></div><div className="coach-suggestions">{COACH_SUGGESTIONS.map((suggestion) => <button type="button" key={suggestion} onClick={() => ask(suggestion)}>{suggestion}</button>)}</div><form className="coach-composer" onSubmit={(event) => { event.preventDefault(); ask(); }}><button type="button" className={`coach-mic ${listening ? "active" : ""}`} onClick={toggleListening} aria-label={listening ? "Parar gravação" : "Falar pergunta"}>{listening ? <MicOff size={18} /> : <Mic size={18} />}</button><input value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Ex.: como executar o agachamento?" aria-label="Pergunte à Monster Coach" /><Button type="submit" aria-label="Enviar pergunta"><Send size={17} /></Button></form><small className="coach-audio-note">O botão de ouvir usa a voz do seu próprio navegador. O microfone depende do suporte e da permissão do dispositivo.</small></Card>
    </div>
  </div>;
}
