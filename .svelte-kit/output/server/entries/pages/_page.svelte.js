import { a as store_get, b as attr, u as unsubscribe_stores, c as bind_props, d as attr_class, e as ensure_array_like, h as head } from "../../chunks/index2.js";
import { d as derived, w as writable } from "../../chunks/index.js";
import { X as escape_html } from "../../chunks/context.js";
const cards = writable([]);
const isFormOpen = writable(false);
const isLoading = writable(false);
derived(cards, ($cards) => $cards.length);
const activeCards = derived(
  cards,
  ($cards) => $cards.filter((c) => c.status === "active")
);
const completedCards = derived(
  cards,
  ($cards) => $cards.filter((c) => c.status === "done")
);
const filterStatus = writable("all");
const filterQuery = writable("");
const filteredCards = derived(
  [cards, filterStatus, filterQuery],
  ([$cards, $status, $query]) => {
    let result = $cards.slice();
    if ($status !== "all") {
      result = result.filter((c) => $status === "active" ? c.status === "active" : c.status === "done");
    }
    if ($query && $query.trim() !== "") {
      const q = $query.toLowerCase();
      result = result.filter((c) => {
        return (c.title || "").toLowerCase().includes(q) || (c.prompt || "").toLowerCase().includes(q) || (c.topic || "").toLowerCase().includes(q);
      });
    }
    return result;
  }
);
function addCard(card) {
  cards.update((current) => [card, ...current]);
}
function updateCardStatus(id, status) {
  cards.update(
    (current) => current.map((card) => card.id === id ? { ...card, status } : card)
  );
}
function AddForm($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let isValid;
    let onSubmit = $$props["onSubmit"];
    let title = "";
    let topic = "";
    let prompt = "";
    let isSubmitting = false;
    isValid = title.trim().length > 0 && prompt.trim().length > 0;
    if (store_get($$store_subs ??= {}, "$isFormOpen", isFormOpen)) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<section id="add-section"><form><h2>New Card Details</h2> `);
      {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--> <div class="field"><label for="title">Title <span class="required">*</span></label> <input id="title"${attr("value", title)} type="text" autocomplete="off" required${attr("disabled", isSubmitting, true)}/> <span class="hint">Give your learning card a clear, memorable name.</span></div> <div class="field"><label for="topic">Topic <span class="optional">(optional)</span></label> <input id="topic"${attr("value", topic)} type="text" autocomplete="off"${attr("disabled", isSubmitting, true)}/> <span class="hint">e.g., JavaScript, Design Patterns, Math</span></div> <div class="field"><label for="prompt">Learning prompt <span class="required">*</span></label> <textarea id="prompt" required${attr("disabled", isSubmitting, true)} placeholder="e.g. Explain the concept of closures in JavaScript">`);
      const $$body = escape_html(prompt);
      if ($$body) {
        $$renderer2.push(`${$$body}`);
      }
      $$renderer2.push(`</textarea> <span class="hint">What do you want to learn or understand?</span></div> <div class="form-actions"><button type="submit" class="primary"${attr("disabled", !isValid || isSubmitting, true)}>${escape_html("Save card")}</button> <button type="button" class="ghost"${attr("disabled", isSubmitting, true)}>Cancel</button></div></form></section>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]-->`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, { onSubmit });
  });
}
function CardItem($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let isDone, buttonLabel, statusText;
    let card = $$props["card"];
    let onStart = $$props["onStart"];
    let onToggle = $$props["onToggle"];
    isDone = card.status === "done";
    buttonLabel = isDone ? "Mark active" : "Mark done";
    statusText = isDone ? "✓ Completed" : "Active";
    $$renderer2.push(`<article${attr_class("card svelte-ybr5in", void 0, { "done": isDone })}><header><h3>${escape_html(card.title)}</h3> `);
    if (card.topic) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<p class="topic">${escape_html(card.topic)}</p>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></header> <section><div${attr_class("status svelte-ybr5in", void 0, { "done": isDone })}>${escape_html(statusText)}</div> <pre class="prompt">${escape_html(card.prompt)}</pre></section> <footer class="card-actions"><button type="button" class="primary">Start in ChatGPT</button> <button type="button" class="ghost"${attr("aria-pressed", isDone)}>${escape_html(buttonLabel)}</button></footer></article>`);
    bind_props($$props, { card, onStart, onToggle });
  });
}
function CardList($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let onStart = $$props["onStart"];
    let onToggle = $$props["onToggle"];
    $$renderer2.push(`<section><h2>Your learning cards</h2> <div class="filters"><label class="filter">Show: <select>`);
    $$renderer2.option({ value: "all" }, ($$renderer3) => {
      $$renderer3.push(`All (${escape_html(store_get($$store_subs ??= {}, "$cards", cards).length)})`);
    });
    $$renderer2.option({ value: "active" }, ($$renderer3) => {
      $$renderer3.push(`Active (${escape_html(store_get($$store_subs ??= {}, "$activeCards", activeCards).length)})`);
    });
    $$renderer2.option({ value: "done" }, ($$renderer3) => {
      $$renderer3.push(`Completed (${escape_html(store_get($$store_subs ??= {}, "$completedCards", completedCards).length)})`);
    });
    $$renderer2.push(`</select></label> <label class="filter search">Search: <input type="search" placeholder="Search title, prompt, topic"/></label></div> <div class="card-list">`);
    if (store_get($$store_subs ??= {}, "$filteredCards", filteredCards).length === 0) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<p class="empty-state">No learning cards match your filters.</p>`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<!--[-->`);
      const each_array = ensure_array_like(store_get($$store_subs ??= {}, "$filteredCards", filteredCards));
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let card = each_array[$$index];
        CardItem($$renderer2, { card, onStart, onToggle });
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--></div></section>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, { onStart, onToggle });
  });
}
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    async function handleFormSubmit(data) {
      const newCard = await window.api.addCard(data);
      addCard(newCard);
      announceToSR(`Card "${data.title}" added successfully`);
    }
    async function handleCardStart(prompt) {
      await window.api.runPrompt(prompt);
      announceToSR("Opening prompt in ChatGPT");
    }
    async function handleCardToggle(id, status) {
      await window.api.toggleCard(id, status);
      updateCardStatus(id, status);
      announceToSR(`Card marked as ${status}`);
    }
    function announceToSR(message) {
      const announcer = document.getElementById("sr-announcements");
      if (announcer) {
        announcer.textContent = message;
      }
    }
    head("1uha8ag", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Learning Cards</title>`);
      });
      $$renderer3.push(`<meta name="description" content="Finish what you start"/>`);
    });
    $$renderer2.push(`<div id="sr-announcements" class="sr-only" aria-live="polite" aria-atomic="true"></div> <div class="container"><header><h1>Learning Cards</h1> <p class="subtitle">Finish what you start</p> <div class="top-actions"><button class="primary"${attr("aria-expanded", store_get($$store_subs ??= {}, "$isFormOpen", isFormOpen))} aria-controls="add-section">+ Add learning card</button></div></header> <main id="main-content">`);
    AddForm($$renderer2, { onSubmit: handleFormSubmit });
    $$renderer2.push(`<!----> `);
    if (store_get($$store_subs ??= {}, "$isLoading", isLoading)) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<p>Loading cards...</p>`);
    } else {
      $$renderer2.push("<!--[!-->");
      CardList($$renderer2, { onStart: handleCardStart, onToggle: handleCardToggle });
    }
    $$renderer2.push(`<!--]--></main></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
export {
  _page as default
};
