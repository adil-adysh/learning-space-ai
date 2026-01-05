<script lang="ts">
  import MarkdownIt from 'markdown-it';
  import DOMPurify from 'dompurify';

  export let markdown: string = '';

  const md = new MarkdownIt({ html: true, linkify: true, typographer: true });

  let html = '';
  $: {
    if (typeof window !== 'undefined') {
      const raw = md.render(markdown || '');
      html = DOMPurify.sanitize(raw);
    } else {
      html = '';
    }
  }
</script>

<article class="note-content">
  {@html html}
</article>

<style>
  .note-content pre { white-space: pre-wrap; }
  .note-content img { max-width: 100%; height: auto; }
</style>
