<script lang="ts">
import ModalContainer from "../ModalContainer.svelte";
import CardItem from "../CardItem.svelte";
import type { LearningCard, NoteApi } from "../../types";

void ModalContainer; // used in test wrapper markup
void CardItem; // used in test wrapper markup
export let card: LearningCard;
export let onStart: (card: LearningCard) => void = () => {};
export let onToggle: (id: string, status: "active" | "done") => void = () => {};
export let onEdit: (card: LearningCard) => void = () => {};
export let onDelete: (id: string) => void = () => {};
export let noteApi: NoteApi | null = null;
</script>

<ModalContainer />
<CardItem {card} {onStart} {onToggle} onEdit={onEdit} onDelete={onDelete} noteApi={noteApi} />
