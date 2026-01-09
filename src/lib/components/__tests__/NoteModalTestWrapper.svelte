<script lang="ts">
import ModalContainer from "../ModalContainer.svelte";
import NoteModal from "../NoteModal.svelte";
export let cardId: string;
export let cardTitle: string;
export let confirmFn: () => boolean;
</script>

<ModalContainer />
<NoteModal {cardId} {cardTitle} {confirmFn} />
