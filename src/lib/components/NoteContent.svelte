<script lang="ts">
import MarkdownIt from "markdown-it";
import DOMPurify from "dompurify";

export const markdown: string = "";

const md = new MarkdownIt({ html: true, linkify: true, typographer: true });

let _html = "";
$: {
	if (typeof window !== "undefined") {
		const raw = md.render(markdown || "");
		_html = DOMPurify.sanitize(raw);
	} else {
		_html = "";
	}
}
</script>

<article class="note-content">
  {@html _html}
</article>

<style>
  :global(.note-content pre) { white-space: pre-wrap; }
  :global(.note-content img) { max-width: 100%; height: auto; }
</style>
