<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';

  const dispatch = createEventDispatcher();

  const { ariaLabel }: { ariaLabel?: string } = $props();

  let detailsEl: HTMLDetailsElement | null = null;
  let menuEl: HTMLDivElement | null = null;

  function handleEdit() {
    dispatch('edit');
    detailsEl && (detailsEl.open = false);
  }

  function handleDelete() {
    dispatch('delete');
    detailsEl && (detailsEl.open = false);
  }

  // when the disclosure opens, focus first actionable item
  $effect(() => {
    if (detailsEl?.open) {
      requestAnimationFrame(() => {
        const first = menuEl?.querySelector<HTMLElement>('button');
        first?.focus();
      });
    }
  });
</script>

<details class="more-menu" bind:this={detailsEl}>
  <summary
    class="more-trigger"
    aria-label={ariaLabel}
    
    onkeydown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        detailsEl && (detailsEl.open = !detailsEl.open);
      }
    }}
  >
    <span aria-hidden="true">⋮</span>
  </summary>

    <div class="menu" bind:this={menuEl} role="menu">
    <button type="button" role="menuitem" onclick={handleEdit}>Edit</button>
    <button type="button" role="menuitem" class="danger" onclick={handleDelete}>Delete</button>
  </div>
</details>

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
