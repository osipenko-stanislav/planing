import { createContext, useContext, useState, type ReactNode } from 'react';
const Context = createContext<(text: string, error?: boolean) => void>(() => {});
export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);
  return <Context value={(text, error = false) => setMessage({ text, error })}>{children}{message && <div className={`toast ${message.error ? 'toast-error' : ''}`} role={message.error ? 'alert' : 'status'}><span>{message.error ? '!' : '✓'}</span><div>{message.text}</div><button onClick={() => setMessage(null)} aria-label="Закрыть уведомление">×</button></div>}</Context>;
}
export const useFeedback = () => useContext(Context);
