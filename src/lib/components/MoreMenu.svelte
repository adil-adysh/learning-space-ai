<script lang="ts">
  import { createEventDispatcher, onMount, onDestroy } from 'svelte';

  const dispatch = createEventDispatcher();

  export let ariaLabel = 'More actions';

  let open = false;
  let buttonEl: HTMLButtonElement | null = null;
  let menuEl: HTMLDivElement | null = null;

  function toggle() {
    open = !open;
    if (open) focusFirst();
  }

  function close() {
    open = false;
    buttonEl?.focus();
  }

  function focusFirst() {
    requestAnimationFrame(() => {
      const first = menuEl?.querySelector<HTMLElement>('button');
      first?.focus();
    });
  }

  function onKeyDown(e: KeyboardEvent) {
    if (!open) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      close();
    }
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const items = Array.from(menuEl?.querySelectorAll<HTMLElement>('button') || []);
      if (!items.length) return;
      const idx = items.indexOf(document.activeElement as HTMLElement);
      let next = 0;
      if (e.key === 'ArrowDown') next = (idx + 1) % items.length;
      else next = (idx - 1 + items.length) % items.length;
      items[next].focus();
    }
  }

  function onDocumentClick(e: MouseEvent) {
    if (!open) return;
    const target = e.target as Node;
    if (buttonEl && buttonEl.contains(target)) return;
    if (menuEl && menuEl.contains(target)) return;
    close();
  }

  onMount(() => {
    document.addEventListener('click', onDocumentClick);
    document.addEventListener('keydown', onKeyDown as any);
  });
  onDestroy(() => {
    document.removeEventListener('click', onDocumentClick);
    document.removeEventListener('keydown', onKeyDown as any);
  });

  // Forward actions
  function handleEdit() {
    dispatch('edit');
    close();
  }
  function handleDelete() {
    dispatch('delete');
    close();
  }
</script>

<div class="more-menu">
  <button
    bind:this={buttonEl}
    type="button"
    class="more-trigger"
    aria-haspopup="true"
    aria-expanded={open}
    aria-label={ariaLabel}
    on:click={toggle}
  >
    <span aria-hidden="true">⋮</span>
  </button>

  {#if open}
    <div
      class="menu"
      role="menu"
      bind:this={menuEl}
    >
      <button type="button" role="menuitem" on:click={handleEdit}>Edit</button>
      <button type="button" role="menuitem" class="danger" on:click={handleDelete}>Delete</button>
    </div>
  {/if}
</div>

<style>
  .more-menu { position: relative; display: inline-block; }
  .more-trigger {
    background: transparent;
    border: none;
    padding: 0.25rem 0.5rem;
    cursor: pointer;
    font-size: 1.1rem;
  }
  .menu {
    position: absolute;
    right: 0;
    top: calc(100% + 0.25rem);
    background: var(--surface, #fff);
    border: 1px solid rgba(0,0,0,0.08);
    box-shadow: 0 6px 18px rgba(0,0,0,0.08);
    border-radius: 6px;
    padding: 0.25rem;
    z-index: 20;
    min-width: 9rem;
    display: flex;
    flex-direction: column;
  }
  .menu button {
    text-align: left;
    background: transparent;
    border: none;
    padding: 0.5rem 0.75rem;
    cursor: pointer;
    width: 100%;
  }
  .menu button:hover { background: rgba(0,0,0,0.03); }
  .menu button:focus {
    outline: 3px solid rgba(59,130,246,0.25);
    outline-offset: 2px;
    border-radius: 4px;
  }
  .menu .danger { color: #b91c1c; }
  .menu .danger:hover { background: rgba(249, 250, 251, 1); color: #991b1b; }
</style>
