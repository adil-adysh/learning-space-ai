<script lang="ts">
import ModalContainer from "../ModalContainer.svelte";
import NoteModal from "../NoteModal.svelte";

void ModalContainer; // used in test wrapper markup
void NoteModal; // used in test wrapper markup
export let cardId: string;
export let cardTitle: string;
export let confirmFn: () => boolean;
</script>

<ModalContainer />
<NoteModal {cardId} {cardTitle} {confirmFn} />
