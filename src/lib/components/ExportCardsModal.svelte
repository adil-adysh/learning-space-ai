<script lang="ts">
import type { LearningCardBundleV1 } from "../../types";
import { downloadJSON } from "../utils/cardImportExport";

interface Props {
	bundle: LearningCardBundleV1;
	filename: string;
	onClose: () => void;
}

const { bundle, filename, onClose }: Props = $props();

let jsonText = $state<string>(JSON.stringify(bundle, null, 2));
let isDownloading = $state(false);

// Keep JSON text in sync with bundle using runes effect
$effect(() => {
	jsonText = JSON.stringify(bundle, null, 2);
});
function handleDownload() {
	isDownloading = true;
	try {
		// Parse the latest JSON text to ensure we download the current preview
		const data = JSON.parse(jsonText);
		downloadJSON(data, filename);
	} finally {
		isDownloading = false;
	}
}
</script>

<div class="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="export-heading" tabindex="0">
	<div class="modal-content">
		<header>
			<h2 id="export-heading">Export Preview</h2>
		</header>

		<p>Preview the JSON that will be exported for this project. You can download the file to your computer.</p>

		<div class="preview">
			<label for="export-json">Filename: <strong>{filename}</strong></label>
			<textarea id="export-json" rows="12" readonly bind:value={jsonText}></textarea>
		</div>

		<footer>
			<button class="secondary" type="button" onclick={onClose}>Close</button>
			<button class="primary" type="button" onclick={handleDownload} disabled={isDownloading}>{isDownloading ? 'Saving...' : 'Save / Download'}</button>
		</footer>
	</div>
</div>

<style>
.modal-overlay {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(0,0,0,0.5);
	display:flex;
	align-items:center;
	justify-content:center;
	z-index:1000;
}
.modal-content {
	background:white;
	padding:1.25rem;
	border-radius:8px;
	max-width:800px;
	width:90%;
}
.preview textarea {
	width:100%;
	font-family:monospace;
	padding:0.75rem;
	border-radius:4px;
	border:1px solid #ddd;
}
footer { display:flex; gap:8px; justify-content:flex-end; margin-top:1rem; }
button.primary { background:#007bff; color:white; }
button.secondary { background:#f0f0f0; }
</style>