<slot />

<!-- Global modal container mounted once at app root -->
<script>
import ModalContainer from "../lib/components/ModalContainer.svelte";

void ModalContainer; // used in markup
</script>

<ModalContainer />
