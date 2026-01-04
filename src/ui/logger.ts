const KEY = 'learning_cards_diagnostics_v1';

export function isEnabled(): boolean {
  try { return localStorage.getItem(KEY) === '1'; } catch { return false; }
}

export function setEnabled(v: boolean) {
  try { localStorage.setItem(KEY, v ? '1' : '0'); } catch {}
}

export function log(component: string, event: string, details?: any) {
  if (!isEnabled()) return;
  try {
    const msg = { ts: new Date().toISOString(), component, event, details };
    // console.debug is useful for dev
    // eslint-disable-next-line no-console
    console.debug('[diag]', JSON.stringify(msg));
    // append to visible diagnostics area if present
    const el = document.querySelector('#diag-logs') as HTMLElement | null;
    if (el) {
      const line = document.createElement('div');
      line.textContent = `${msg.ts} ${component}: ${event} ${details ? JSON.stringify(details) : ''}`;
      el.appendChild(line);
    }
  } catch (e) {
    // ignore logging errors
  }
}
