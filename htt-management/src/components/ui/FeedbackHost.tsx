import { useEffect, useRef, useState } from "react";
import { AlertCircle, CheckCircle2, Info, TriangleAlert, X } from "lucide-react";
import { feedback, type ConfirmationRequest, type FeedbackMessage } from "./feedback";
import { Button } from "./Button";

const tones = {
  success: { icon: CheckCircle2, className: "border-emerald-200 bg-emerald-50 text-emerald-900" },
  error: { icon: AlertCircle, className: "border-red-200 bg-red-50 text-red-900" },
  warning: { icon: TriangleAlert, className: "border-amber-200 bg-amber-50 text-amber-900" },
  info: { icon: Info, className: "border-sky-200 bg-sky-50 text-sky-900" },
};

export function FeedbackHost() {
  const [messages, setMessages] = useState<FeedbackMessage[]>([]);
  const [confirmation, setConfirmation] = useState<{ request: ConfirmationRequest; resolve: (value: boolean) => void } | null>(null);
  const confirmationRef = useRef<typeof confirmation>(null);
  confirmationRef.current = confirmation;
  useEffect(() => {
    const unsubscribeToast = feedback.subscribe(item => {
      setMessages(current => [...current.slice(-3), item]);
      window.setTimeout(() => setMessages(current => current.filter(message => message.id !== item.id)), 4500);
    });
    const unsubscribeConfirm = feedback.subscribeConfirm((request, resolve) => {
      if (confirmationRef.current) { resolve(false); return; }
      setConfirmation({ request, resolve });
    });
    return () => { unsubscribeToast(); unsubscribeConfirm(); confirmationRef.current?.resolve(false); };
  }, []);
  useEffect(() => {
    if (!confirmation) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") { confirmation.resolve(false); setConfirmation(null); }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [confirmation]);
  const answer = (value: boolean) => {
    confirmation?.resolve(value);
    setConfirmation(null);
  };
  return <>
    <div className="pointer-events-none fixed right-6 top-20 z-[100] flex w-[min(390px,calc(100vw-3rem))] flex-col gap-2" aria-live="polite" aria-atomic="false">
      {messages.map(item => {
        const tone = tones[item.tone]; const Icon = tone.icon;
        return <div key={item.id} role={item.tone === "error" ? "alert" : "status"} className={`pointer-events-auto flex items-start gap-3 rounded-xl border p-4 shadow-lg ${tone.className}`}>
          <Icon className="mt-0.5 shrink-0" size={18} /><p className="min-w-0 flex-1 text-sm">{item.message}</p>
          <button type="button" aria-label="Dismiss notification" onClick={() => setMessages(current => current.filter(message => message.id !== item.id))}><X size={17} /></button>
        </div>;
      })}
    </div>
    {confirmation && <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/45 p-6" onMouseDown={event => { if (event.target === event.currentTarget) answer(false); }}>
      <div role="alertdialog" aria-modal="true" aria-labelledby="global-confirm-title" aria-describedby="global-confirm-message" className="w-full max-w-md rounded-2xl border border-[var(--color-border)] bg-white p-6 shadow-2xl">
        <h2 id="global-confirm-title" className="text-lg font-semibold">{confirmation.request.title}</h2>
        <p id="global-confirm-message" className="mt-3 text-sm text-[var(--color-text-secondary)]">{confirmation.request.message}</p>
        <div className="mt-6 flex justify-end gap-3"><Button variant="secondary" onClick={() => answer(false)}>Cancel</Button><Button autoFocus variant={confirmation.request.destructive ? "danger" : "primary"} onClick={() => answer(true)}>{confirmation.request.confirmLabel ?? "Confirm"}</Button></div>
      </div>
    </div>}
  </>;
}
