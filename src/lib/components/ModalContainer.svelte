<script lang="ts">
  import { onMount } from 'svelte';
  import { modalStore } from '../stores/modalStore';
  import { tick } from 'svelte';

  let containerRef: HTMLElement | null = $state(null);
  let focusableElements: HTMLElement[] = $state([] as HTMLElement[]);

  // read the raw stack and the derived current item
  const stack = modalStore; // store has subscribe (stack)
  const current = modalStore.current;
  const lastOpener = modalStore.lastOpener;

  // focus trap: when modal stack has any item, focus first actionable element in the top view
  $effect(() => {
    if ($stack.length > 0) {
      tick().then(() => {
        const root = containerRef;
        if (!root) return;
        const selector = 'a[href], button:not([disabled]):not([aria-hidden="true"]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
        focusableElements = Array.from(root.querySelectorAll(selector)) as HTMLElement[];
        // focus first focusable inside the visible (top) pane
        const top = root.querySelector('.modal-pane.top');
        if (top) {
          const first = top.querySelector<HTMLElement>(selector);
          if (first) {
            first.focus();
            return;
          }
        }
        if (focusableElements.length > 0) {
          focusableElements[0].focus();
        } else {
          root.focus();
        }
      });
    }
  });

  // when the stack becomes empty, return focus to the last opener element if available
  $effect(() => {
    if ($stack.length === 0) {
      const opener = $lastOpener;
      if (opener && typeof opener.focus === 'function') {
        tick().then(() => {
          try {
            opener.focus();
          } catch (e) {
            // ignore
          }
        });
      }
    }
  });

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      modalStore.close();
      return;
    }

    if (e.key === 'Tab') {
      // trap focus inside the modal
      const elems = focusableElements;
      if (!containerRef) return;
      if (elems.length === 0) {
        e.preventDefault();
        return;
      }

      const active = document.activeElement as HTMLElement;
      let idx = elems.indexOf(active);
      if (e.shiftKey) {
        idx = idx <= 0 ? elems.length - 1 : idx - 1;
      } else {
        idx = idx === -1 || idx >= elems.length - 1 ? 0 : idx + 1;
      }
      elems[idx].focus();
      e.preventDefault();
    }
  }

  onMount(() => {
    // nothing else; keydown is handled on the container
  });
</script>

{#if $stack.length > 0}
  <button
    type="button"
    class="modal-backdrop"
    onclick={() => modalStore.close()}
    aria-hidden="true"
  ></button>
  <div
    class="modal-root"
    tabindex="-1"
    bind:this={containerRef}
    onkeydown={handleKeydown}
    role="dialog"
    aria-modal="true"
  >
    {#each $stack as item, idx}
      <div class="modal-pane {idx === $stack.length - 1 ? 'top' : 'hidden'}" aria-hidden={idx === $stack.length - 1 ? 'false' : 'true'}>
        {#if item.component}
          <item.component {...(item.props || {})} on:close={() => modalStore.close()} on:back={() => modalStore.pop()} />
        {/if}
      </div>
    {/each}
  </div>
{/if}

<style>
  .modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.4);
    z-index: 60;
  }

  .modal-root {
    position: fixed;
    inset: 0;
    display:flex;
    align-items:center;
    justify-content:center;
    z-index: 61;
    outline: none;
  }
  .modal-pane.hidden { display: none; }
  .modal-pane.top { display: block; }
</style>
