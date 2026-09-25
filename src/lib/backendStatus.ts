import { useSyncExternalStore } from "react";

/**
 * Supabase reachability status — powers the "community features offline"
 * banner and offline-aware empty states (T1.1). The probe is a plain HEAD to
 * the REST root: any HTTP response (200/401/404/405 …) means the host is
 * reachable; only a network failure or timeout counts as offline. Schema/API
 * errors are deliberately NOT "offline" — the backend is up for those.
 */

export type BackendStatus = "checking" | "online" | "offline";

let status: BackendStatus = "checking";
const listeners = new Set<() => void>();

function setStatus(next: BackendStatus): void {
  if (status === next) return;
  status = next;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): BackendStatus {
  return status;
}

export function useBackendStatus(): BackendStatus {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

/** One reachability probe; updates the shared status. */
export async function probeBackend(timeoutMs = 6000): Promise<BackendStatus> {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    setStatus("offline");
    return status;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    await fetch(`${url}/rest/v1/`, {
      method: "HEAD",
      headers: { apikey: anonKey },
      signal: controller.signal,
      cache: "no-store",
    });
    setStatus("online");
  } catch {
    setStatus("offline");
  } finally {
    clearTimeout(timer);
  }
  return status;
}

/**
 * Probe now, keep re-probing every `intervalMs` (so the banner clears when the
 * backend returns) and immediately when the browser regains connectivity.
 * Returns a cleanup function.
 */
export function startBackendMonitor(intervalMs = 45000): () => void {
  void probeBackend();

  const onOnline = () => {
    void probeBackend();
  };
  window.addEventListener("online", onOnline);

  const interval = window.setInterval(() => {
    void probeBackend();
  }, intervalMs);

  return () => {
    window.removeEventListener("online", onOnline);
    window.clearInterval(interval);
  };
}
