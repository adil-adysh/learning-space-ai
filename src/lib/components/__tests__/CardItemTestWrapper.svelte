<script lang="ts">
import ModalContainer from "../ModalContainer.svelte";
import CardItem from "../CardItem.svelte";

void ModalContainer; // used in test wrapper markup
void CardItem; // used in test wrapper markup
export let card: unknown;
export let onStart: (...args: unknown[]) => void;
export let onToggle: (...args: unknown[]) => void;
export let onEdit: (...args: unknown[]) => void;
export let onDelete: (...args: unknown[]) => void;
export let noteApi: unknown;
</script>

<ModalContainer />
<CardItem {card} {onStart} {onToggle} onEdit={onEdit} onDelete={onDelete} noteApi={noteApi} />
