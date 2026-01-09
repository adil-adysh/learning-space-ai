<script lang="ts">
import CardItem from "../CardItem.svelte";
import ModalContainer from "../ModalContainer.svelte";
export let card: unknown;
export let onStart: (...args: unknown[]) => void;
export let onToggle: (...args: unknown[]) => void;
export let onEdit: (...args: unknown[]) => void;
export let onDelete: (...args: unknown[]) => void;
export let noteApi: unknown;
</script>

<ModalContainer />
<CardItem {card} {onStart} {onToggle} onEdit={onEdit} onDelete={onDelete} noteApi={noteApi} />
