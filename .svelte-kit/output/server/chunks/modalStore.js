import { d as derived, w as writable } from "./index.js";
function createModalStore() {
  const stack = writable([]);
  const lastOpener = writable(null);
  function push(component, props = {}, opener = null) {
    stack.update((s) => [...s, { component, props, opener }]);
  }
  function pop() {
    let popped;
    stack.update((s) => {
      if (s.length === 0) return s;
      const copy = s.slice();
      popped = copy.pop();
      if (copy.length === 0 && popped) lastOpener.set(popped.opener || null);
      return copy;
    });
    return popped;
  }
  function close() {
    let top;
    stack.update((s) => {
      if (s.length > 0) top = s[s.length - 1];
      return [];
    });
    lastOpener.set(top?.opener || null);
  }
  function open(component, props = {}, opener = null) {
    push(component, props, opener);
  }
  const current = derived(
    stack,
    ($stack) => $stack.length ? $stack[$stack.length - 1] : null
  );
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
    lastOpener: { subscribe: lastOpener.subscribe }
  };
}
const modalStore = createModalStore();
export {
  modalStore as m
};
