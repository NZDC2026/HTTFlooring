export type FeedbackTone = "success" | "error" | "warning" | "info";
export interface FeedbackMessage { id: number; tone: FeedbackTone; message: string }
export interface ConfirmationRequest { title: string; message: string; confirmLabel?: string; destructive?: boolean }
let nextId = 0;
const feedbackListeners = new Set<(message: FeedbackMessage) => void>();
const confirmationListeners = new Set<(request: ConfirmationRequest, resolve: (accepted: boolean) => void) => void>();
export const feedback = {
  notify(tone: FeedbackTone, message: string) {
    const item = { id: ++nextId, tone, message };
    feedbackListeners.forEach(listener => listener(item));
  },
  success(message: string) { this.notify("success", message); },
  error(message: string) { this.notify("error", message); },
  warning(message: string) { this.notify("warning", message); },
  info(message: string) { this.notify("info", message); },
  subscribe(listener: (message: FeedbackMessage) => void) {
    feedbackListeners.add(listener);
    return () => { feedbackListeners.delete(listener); };
  },
  confirm(request: ConfirmationRequest): Promise<boolean> {
    const listener = confirmationListeners.values().next().value;
    if (!listener) return Promise.resolve(false); // fail closed when no dialog host exists
    return new Promise(resolve => listener(request, resolve));
  },
  subscribeConfirm(listener: (request: ConfirmationRequest, resolve: (accepted: boolean) => void) => void) {
    confirmationListeners.add(listener);
    return () => { confirmationListeners.delete(listener); };
  },
};
