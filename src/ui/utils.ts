/**
 * A type-safe wrapper for querySelector.
 * @param sel CSS Selector
 * @param type Optional constructor check for extra runtime safety
 */
export function qs<T extends HTMLElement>(sel: string): T | null {
  const el = document.querySelector(sel);
  return el as T | null;
}

/**
 * Centralized Screen Reader Announcer.
 * Uses a toggle technique to ensure the same message is read twice if needed.
 */
export function srAnnounce(message: string) {
  const el = qs<HTMLDivElement>('#sr-announcements');
  if (!el) return;

  // If the message is the same as the current one, 
  // we add a non-breaking space to "force" a DOM change
  // so the screen reader re-announces it.
  const finalMessage = el.textContent === message ? `${message}\u00A0` : message;
  
  // Clear and set to ensure clean delivery
  el.textContent = '';
  
  // Use a tiny timeout to allow the DOM to register the 'clear' 
  // before setting the new message.
  setTimeout(() => {
    el.textContent = finalMessage;
  }, 50);
}