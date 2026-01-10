<script lang="ts">
import DOMPurify from "dompurify";
import MarkdownIt from "markdown-it";

// read incoming props and mirror into state so updates are reactive
const props = $props() as { markdown?: string };
let mdInput = $state(props.markdown ?? "");

const md = new MarkdownIt({ html: true, linkify: true, typographer: true });

$effect(() => {
	mdInput = props.markdown ?? "";
});

let _html = $state("");
$effect(() => {
	if (typeof window === "undefined") {
		_html = "";
		return;
	}
	const raw = md.render(mdInput || "");
	// DOMPurify may be either the sanitizer object with `sanitize` or a factory function
	type DomPurifySanitizer = { sanitize: (s: string) => string };
	type DomPurifyFactory = (win: Window) => DomPurifySanitizer;
	const dp = DOMPurify as unknown as DomPurifySanitizer | DomPurifyFactory;
	try {
		if ((dp as DomPurifySanitizer).sanitize instanceof Function) {
			_html = (dp as DomPurifySanitizer).sanitize(raw);
		} else if (typeof dp === "function") {
			_html = (dp as DomPurifyFactory)(window).sanitize(raw);
		} else {
			_html = raw;
		}
	} catch (_e) {
		// fallback: use the raw output if sanitization fails
		_html = raw;
	}
});
</script>

<article class="note-content">
  {@html _html}
</article>

<style>
  :global(.note-content pre) { white-space: pre-wrap; }
  :global(.note-content img) { max-width: 100%; height: auto; }
</style>
