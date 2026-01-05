<script lang="ts">
  import CardItem from '../CardItem.svelte';
  import ModalContainer from '../ModalContainer.svelte';
  export let card: any;
  export let onStart: any;
  export let onToggle: any;
  export let onEdit: any;
  export let onDelete: any;
  export let noteApi: any;
</script>

<ModalContainer />
<CardItem {card} {onStart} {onToggle} onEdit={onEdit} onDelete={onDelete} noteApi={noteApi} />
