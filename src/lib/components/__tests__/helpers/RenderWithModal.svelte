<script lang="ts">
import ModalTestShell from "./ModalTestShell.svelte";
import type { ComponentType } from "svelte";
export let component: ComponentType;
export let props: Record<string, unknown> | undefined;
void ModalTestShell;
</script>

<ModalTestShell />
<svelte:component this={component} {...(props || {})} />
