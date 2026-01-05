import type { SvelteComponent } from 'svelte';
import { writable, derived } from 'svelte/store';

type StackItem = {
  component: typeof SvelteComponent;
  props?: Record<string, any> | null;
  opener?: HTMLElement | null;
};

function createModalStore() {
  const stack = writable<StackItem[]>([]);
  const lastOpener = writable<HTMLElement | null>(null);

  function push(component: typeof SvelteComponent, props: Record<string, any> = {}, opener: HTMLElement | null = null) {
    stack.update((s) => [...s, { component, props, opener }]);
  }

  function pop() {
    let popped: StackItem | undefined;
    stack.update((s) => {
      if (s.length === 0) return s;
      const copy = s.slice();
      popped = copy.pop();
      // if we've emptied the stack, remember the opener for focus return
      if (copy.length === 0 && popped) lastOpener.set(popped.opener || null);
      return copy;
    });
    return popped;
  }

  function close() {
    // remember opener of top item then clear stack
    let top: StackItem | undefined;
    stack.update((s) => {
      if (s.length > 0) top = s[s.length - 1];
      return [];
    });
    lastOpener.set(top?.opener || null);
  }

  // backward-compatible alias for `push`
  function open(component: typeof SvelteComponent, props: Record<string, any> = {}, opener: HTMLElement | null = null) {
    push(component, props, opener);
  }

  const current = derived(stack, ($stack) => ($stack.length ? $stack[$stack.length - 1] : null));

  return {
    // expose the raw stack subscribe so consumers can render all items
    subscribe: stack.subscribe,
    push,
    pop,
    close,
    open,
    // derived helpers
    current,
    // export lastOpener store for focus management
    lastOpener: { subscribe: lastOpener.subscribe },
  };
}

export const modalStore = createModalStore();
