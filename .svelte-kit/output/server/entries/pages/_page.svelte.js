import { V as attr, W as ensure_array_like, X as bind_props, Y as attr_class, Z as store_get, _ as unsubscribe_stores, $ as head } from "../../chunks/index2.js";
import "clsx";
import { b as ssr_context, n as noop, e as escape_html } from "../../chunks/context.js";
import { createForm as createForm$1 } from "@felte/core";
import { w as writable } from "../../chunks/index.js";
function onDestroy(fn) {
  /** @type {SSRContext} */
  ssr_context.r.on_destroy(fn);
}
function createEventDispatcher() {
  return noop;
}
class ProjectManager {
  constructor() {
    this.all = [];
    this.isLoading = false;
    this.viewMode = "list";
    this.selectedProjectId = null;
  }
  // Derived value for backward compatibility
  get selectedProject() {
    if (this.viewMode === "list") return "all";
    if (this.viewMode === "create") return "create";
    return this.selectedProjectId || "all";
  }
  /**
   * Load all projects from Electron IPC
   */
  async loadProjects() {
    if (typeof window === "undefined" || !window.api) {
      console.warn("Window API not available, skipping project load");
      return;
    }
    this.isLoading = true;
    try {
      const list = await window.api.getProjects();
      if (Array.isArray(list)) {
        this.all = list.slice().sort((a, b) => a.name.localeCompare(b.name));
      }
    } catch (err) {
      console.error("Failed to load projects from main process", err);
    } finally {
      this.isLoading = false;
    }
  }
  /**
   * Create a new project
   */
  async createProject(name) {
    const trimmed = name.trim();
    if (!trimmed) throw new Error("Project name is required");
    const created = await window.api.createProject(trimmed);
    this.all = [...this.all, created].sort((a, b) => a.name.localeCompare(b.name));
    return created;
  }
  /**
   * Select "All Projects" view
   */
  selectAll() {
    this.viewMode = "list";
    this.selectedProjectId = null;
  }
  /**
   * Select a specific project by ID
   */
  selectProject(id) {
    if (id === null || id === "all") {
      this.selectAll();
      return;
    }
    if (id === "create") {
      this.viewMode = "create";
      this.selectedProjectId = null;
      return;
    }
    this.viewMode = "detail";
    this.selectedProjectId = id;
  }
  /**
   * Show project creation form
   */
  selectCreateProject() {
    this.viewMode = "create";
    this.selectedProjectId = null;
  }
  /**
   * Find project by ID
   */
  findById(id) {
    return this.all.find((p) => p.id === id);
  }
}
const projectManager = new ProjectManager();
class CardManager {
  constructor() {
    this.all = [];
    this.isLoading = false;
    this.isFormOpen = false;
    this.filterStatus = "all";
    this.filterQuery = "";
    this.filterProject = "all";
  }
  // Derived computed values using $derived
  get filtered() {
    let result = this.all.slice();
    if (this.filterStatus !== "all") {
      result = result.filter((c) => this.filterStatus === "active" ? c.status === "active" : c.status === "done");
    }
    if (this.filterProject && this.filterProject !== "all") {
      result = result.filter((c) => (c.project || "") === this.filterProject);
    }
    if (this.filterQuery && this.filterQuery.trim() !== "") {
      const q = this.filterQuery.toLowerCase();
      result = result.filter((c) => {
        return (c.title || "").toLowerCase().includes(q) || (c.prompt || "").toLowerCase().includes(q) || (c.topic || "").toLowerCase().includes(q) || (c.project || "").toLowerCase().includes(q);
      });
    }
    return result;
  }
  get activeCards() {
    return this.all.filter((c) => c.status === "active");
  }
  get completedCards() {
    return this.all.filter((c) => c.status === "done");
  }
  get cardCount() {
    return this.all.length;
  }
  /**
   * Load all cards from Electron IPC
   */
  async loadCards() {
    if (typeof window === "undefined" || !window.api) return;
    this.isLoading = true;
    try {
      const rawCards = await window.api.getCards();
      const cards = rawCards.map((c) => ({ ...c, createdAt: new Date(c.createdAt) })).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      this.all = cards;
    } catch (err) {
      console.error("Failed to load cards:", err);
    } finally {
      this.isLoading = false;
    }
  }
  /**
   * Add a new card
   */
  async addCard(data) {
    if (typeof window === "undefined" || !window.api) return;
    try {
      const newCard = await window.api.addCard(data);
      this.all = [newCard, ...this.all];
      return newCard;
    } catch (err) {
      console.error("Failed to add card:", err);
      throw err;
    }
  }
  /**
   * Update card status
   */
  async updateCardStatus(id, status) {
    if (typeof window === "undefined" || !window.api) return;
    try {
      await window.api.toggleCard(id, status);
      const index = this.all.findIndex((c) => c.id === id);
      if (index !== -1) {
        this.all[index] = { ...this.all[index], status };
      }
    } catch (err) {
      console.error("Failed to update card status:", err);
      throw err;
    }
  }
  /**
   * Run a card's prompt in ChatGPT
   */
  async runPrompt(prompt) {
    if (typeof window === "undefined" || !window.api) return;
    try {
      await window.api.runPrompt(prompt);
    } catch (err) {
      console.error("Failed to run prompt:", err);
      throw err;
    }
  }
  /**
   * Toggle the add form visibility
   */
  toggleForm() {
    this.isFormOpen = !this.isFormOpen;
  }
  /**
   * Open the add form
   */
  openForm() {
    this.isFormOpen = true;
  }
  /**
   * Close the add form
   */
  closeForm() {
    this.isFormOpen = false;
  }
  /**
   * Set filter status
   */
  setFilterStatus(status) {
    this.filterStatus = status;
  }
  /**
   * Set filter query
   */
  setFilterQuery(query) {
    this.filterQuery = query;
  }
  /**
   * Set filter project
   */
  setFilterProject(projectId) {
    this.filterProject = projectId;
  }
}
const cardManager = new CardManager();
function AddForm($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let isValid;
    let onSubmit = $$props["onSubmit"];
    let title = "";
    let topic = "";
    let project = "";
    let creatingProject = false;
    let prompt = "";
    let isSubmitting = false;
    isValid = title.trim().length > 0 && prompt.trim().length > 0;
    if (cardManager.isFormOpen) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<section id="add-section"><form aria-labelledby="add-heading"><h2>New Card Details</h2> `);
      {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--> <div class="field"><label for="title">Title <span class="required">*</span></label> <input id="title"${attr("value", title)} type="text" autocomplete="off" required${attr("disabled", isSubmitting, true)}/> <span class="hint">Give your learning card a clear, memorable name.</span></div> <div class="field"><label for="topic">Topic <span class="optional">(optional)</span></label> <input id="topic"${attr("value", topic)} type="text" autocomplete="off"${attr("disabled", isSubmitting, true)}/> <span class="hint">e.g., JavaScript, Design Patterns, Math</span></div> <div class="field"><label for="project-select">Project <span class="optional">(optional)</span></label> `);
      $$renderer2.select(
        {
          id: "project-select",
          value: project,
          onchange: () => {
            {
              creatingProject = false;
            }
          },
          disabled: isSubmitting,
          "aria-describedby": "project-hint"
        },
        ($$renderer3) => {
          $$renderer3.option({ value: "all" }, ($$renderer4) => {
            $$renderer4.push(`All projects`);
          });
          $$renderer3.option({ value: "" }, ($$renderer4) => {
            $$renderer4.push(`Unassigned`);
          });
          $$renderer3.push(`<!--[-->`);
          const each_array = ensure_array_like(projectManager.all);
          for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
            let p = each_array[$$index];
            $$renderer3.option({ value: p.id }, ($$renderer4) => {
              $$renderer4.push(`${escape_html(p.name)}`);
            });
          }
          $$renderer3.push(`<!--]-->`);
          $$renderer3.option({ value: "__create__" }, ($$renderer4) => {
            $$renderer4.push(`+ Create new project...`);
          });
        }
      );
      $$renderer2.push(` <span id="project-hint" class="hint">Assign this card to a project or create a new one.</span></div> `);
      if (creatingProject) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<div class="field"><label for="project">New project name</label> <input id="project"${attr("value", project)} type="text" autocomplete="off"${attr("disabled", isSubmitting, true)}/> <span class="hint">Give your project a short, unique name.</span></div>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--> <div class="field"><label for="prompt">Learning prompt <span class="required">*</span></label> <textarea id="prompt" required${attr("disabled", isSubmitting, true)} placeholder="e.g. Explain the concept of closures in JavaScript">`);
      const $$body = escape_html(prompt);
      if ($$body) {
        $$renderer2.push(`${$$body}`);
      }
      $$renderer2.push(`</textarea> <span class="hint">What do you want to learn or understand?</span></div> <div class="form-actions"><button type="submit" class="primary"${attr("disabled", !isValid || isSubmitting, true)}>${escape_html("Save card")}</button> <button type="button" class="ghost"${attr("disabled", isSubmitting, true)}>Cancel</button></div></form></section>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]-->`);
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
    $$renderer2.push(`<!--]--> `);
    if (card.project) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<p class="project">Project: <strong>${escape_html(projectManager.all.find((p) => p.id === card.project)?.name || card.project)}</strong></p>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></header> <section><div${attr_class("status svelte-ybr5in", void 0, { "done": isDone })}>${escape_html(statusText)}</div> <pre class="prompt">${escape_html(card.prompt)}</pre></section> <footer class="card-actions"><button type="button" class="primary"${attr("aria-label", `Start chat with prompt for ${card.title}`)}>Start in ChatGPT</button> <button type="button" class="ghost"${attr("aria-pressed", isDone)}${attr("aria-label", isDone ? `Mark ${card.title} as active` : `Mark ${card.title} as done`)}>${escape_html(buttonLabel)}</button></footer></article>`);
    bind_props($$props, { card, onStart, onToggle });
  });
}
function CardList($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let onStart = $$props["onStart"];
    let onToggle = $$props["onToggle"];
    function groupByProject(list) {
      const map = /* @__PURE__ */ new Map();
      for (const c of list) {
        const key = c.project || "";
        if (!map.has(key)) map.set(key, []);
        map.get(key).push(c);
      }
      const groups = [];
      for (const [project, cards] of map.entries()) {
        groups.push({
          project,
          cards,
          headingId: `project-${(project || "unassigned").replace(/\s+/g, "-")}`
        });
      }
      groups.sort((a, b) => {
        const aName = a.project ? projectManager.all.find((p) => p.id === a.project)?.name || a.project : "Unassigned";
        const bName = b.project ? projectManager.all.find((p) => p.id === b.project)?.name || b.project : "Unassigned";
        return aName.localeCompare(bName);
      });
      return groups;
    }
    $$renderer2.push(`<section><h2>Your learning cards</h2> <div class="filters"><label class="filter">Project: <select aria-label="Filter by project">`);
    $$renderer2.option({ value: "all" }, ($$renderer3) => {
      $$renderer3.push(`All projects`);
    });
    $$renderer2.option({ value: "" }, ($$renderer3) => {
      $$renderer3.push(`Unassigned`);
    });
    $$renderer2.push(`<!--[-->`);
    const each_array = ensure_array_like(projectManager.all);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let p = each_array[$$index];
      $$renderer2.option({ value: p.id }, ($$renderer3) => {
        $$renderer3.push(`${escape_html(p.name)}`);
      });
    }
    $$renderer2.push(`<!--]--></select></label> <label class="filter">Show: <select>`);
    $$renderer2.option({ value: "all" }, ($$renderer3) => {
      $$renderer3.push(`All (${escape_html(cardManager.all.length)})`);
    });
    $$renderer2.option({ value: "active" }, ($$renderer3) => {
      $$renderer3.push(`Active (${escape_html(cardManager.activeCards.length)})`);
    });
    $$renderer2.option({ value: "done" }, ($$renderer3) => {
      $$renderer3.push(`Completed (${escape_html(cardManager.completedCards.length)})`);
    });
    $$renderer2.push(`</select></label> <label class="filter search">Search: <input type="search" placeholder="Search title, prompt, topic, project" aria-label="Search cards"/></label></div> <div class="card-list">`);
    if (cardManager.filtered.length === 0) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<p class="empty-state" role="status" aria-live="polite">No learning cards match your filters.</p>`);
    } else {
      $$renderer2.push("<!--[!-->");
      if (cardManager.filterProject === "all") {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<!--[-->`);
        const each_array_1 = ensure_array_like(groupByProject(cardManager.filtered));
        for (let $$index_2 = 0, $$length = each_array_1.length; $$index_2 < $$length; $$index_2++) {
          let group = each_array_1[$$index_2];
          $$renderer2.push(`<section class="project-group"${attr("aria-labelledby", group.headingId)}><h3${attr("id", group.headingId)}>${escape_html(group.project ? projectManager.all.find((p) => p.id === group.project)?.name || group.project : "Unassigned")}</h3> <!--[-->`);
          const each_array_2 = ensure_array_like(group.cards);
          for (let $$index_1 = 0, $$length2 = each_array_2.length; $$index_1 < $$length2; $$index_1++) {
            let card = each_array_2[$$index_1];
            CardItem($$renderer2, { card, onStart, onToggle });
          }
          $$renderer2.push(`<!--]--></section>`);
        }
        $$renderer2.push(`<!--]-->`);
      } else {
        $$renderer2.push("<!--[!-->");
        $$renderer2.push(`<!--[-->`);
        const each_array_3 = ensure_array_like(cardManager.filtered);
        for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
          let card = each_array_3[$$index_3];
          CardItem($$renderer2, { card, onStart, onToggle });
        }
        $$renderer2.push(`<!--]-->`);
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--></div></section>`);
    bind_props($$props, { onStart, onToggle });
  });
}
function ProjectsList($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    $$renderer2.push(`<section class="projects svelte-138d5ja"><header><h2>Projects</h2> <div class="actions svelte-138d5ja"><p class="hint">Create a project from the header above.</p></div></header> <ul class="project-list svelte-138d5ja">`);
    if (projectManager.all.length === 0) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<li class="empty svelte-138d5ja">No projects yet — create one.</li>`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<!--[-->`);
      const each_array = ensure_array_like(projectManager.all);
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let p = each_array[$$index];
        $$renderer2.push(`<li><button class="project-card svelte-138d5ja"${attr("aria-label", `Open project ${p.name}`)}><span class="project-name svelte-138d5ja">${escape_html(p.name)}</span></button></li>`);
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--></ul></section>`);
  });
}
function __rest(s, e) {
  var t = {};
  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
    t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function")
    for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
      if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
        t[p[i]] = s[p[i]];
    }
  return t;
}
typeof SuppressedError === "function" ? SuppressedError : function(error, suppressed, message) {
  var e = new Error(message);
  return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};
function createForm(config) {
  const _a = createForm$1(config !== null && config !== void 0 ? config : {}, {
    storeFactory: writable
  }), { cleanup, startStores } = _a, rest = __rest(_a, ["cleanup", "startStores"]);
  onDestroy(cleanup);
  return rest;
}
function ProjectCreate($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    const dispatch = createEventDispatcher();
    let submissionError = null;
    let descriptionIds = "project-hint";
    const { form, errors, isSubmitting, reset } = createForm({
      initialValues: { name: "" },
      validate: (values) => {
        const validation = {};
        if (!values.name || values.name.trim() === "") {
          validation.name = "Project name is required";
        }
        return validation;
      },
      onSubmit: async (values) => {
        submissionError = null;
        const trimmed = values.name?.trim();
        if (!trimmed) return;
        try {
          const created = await projectManager.createProject(trimmed);
          dispatch("created", { project: created.id });
          reset();
        } catch (error) {
          console.error("Failed to create project", error);
          submissionError = error?.message || "Unable to create project right now. Try again in a moment.";
        }
      }
    });
    descriptionIds = store_get($$store_subs ??= {}, "$errors", errors)?.name ? "name-error project-hint" : "project-hint";
    $$renderer2.push(`<section class="project-create svelte-t06kqd"><h2 class="svelte-t06kqd">Create project</h2> <form${attr("aria-describedby", descriptionIds)} class="project-form svelte-t06kqd"><label for="proj-name" class="svelte-t06kqd">Project name</label> <input id="proj-name" name="name" type="text" placeholder="e.g. JavaScript"${attr("aria-invalid", store_get($$store_subs ??= {}, "$errors", errors)?.name ? "true" : "false")}${attr_class("svelte-t06kqd", void 0, {
      "error": store_get($$store_subs ??= {}, "$errors", errors)?.name
    })}/> `);
    if (store_get($$store_subs ??= {}, "$errors", errors)?.name) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<p id="name-error" class="field-error svelte-t06kqd" role="alert">${escape_html(store_get($$store_subs ??= {}, "$errors", errors).name)}</p>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> <p class="hint svelte-t06kqd" id="project-hint">The project name appears in the sidebar list.</p> `);
    if (submissionError) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<p class="submission-error svelte-t06kqd" role="alert">${escape_html(submissionError)}</p>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> <div class="actions svelte-t06kqd"><button type="submit" class="primary svelte-t06kqd"${attr("disabled", store_get($$store_subs ??= {}, "$isSubmitting", isSubmitting), true)}>${escape_html(store_get($$store_subs ??= {}, "$isSubmitting", isSubmitting) ? "Creating..." : "Create project")}</button> <button type="button" class="ghost svelte-t06kqd"${attr("disabled", store_get($$store_subs ??= {}, "$isSubmitting", isSubmitting), true)}>Cancel</button></div></form></section>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
function ProjectDetail($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let projectId = $$props["projectId"];
    let project;
    {
      if (projectManager.all && projectId) {
        project = projectManager.all.find((p) => p.id === projectId);
      }
    }
    $$renderer2.push(`<section class="project-detail svelte-1ykxz3w"><header><h2>${escape_html(project ? project.name : "Project")}</h2> <div class="actions svelte-1ykxz3w"><button class="primary"${attr("aria-expanded", cardManager.isFormOpen)} aria-controls="add-section">+ New Learning Item</button></div></header> `);
    if (cardManager.isFormOpen) {
      $$renderer2.push("<!--[-->");
      AddForm($$renderer2, {
        onSubmit: async (data) => {
          const hasProject = data.project && String(data.project).trim().length > 0;
          const project2 = hasProject ? data.project : projectId || void 0;
          await cardManager.addCard({ ...data, project: project2 });
          cardManager.closeForm();
        }
      });
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> `);
    CardList($$renderer2, {});
    $$renderer2.push(`<!----></section>`);
    bind_props($$props, { projectId });
  });
}
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    head("1uha8ag", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Learning Cards</title>`);
      });
      $$renderer3.push(`<meta name="description" content="Finish what you start"/>`);
    });
    $$renderer2.push(`<div id="sr-announcements" class="sr-only" aria-live="polite" aria-atomic="true"></div> <div class="container"><header><h1>Learning Cards</h1> <p class="subtitle">Finish what you start</p> <div class="top-actions">`);
    if (projectManager.selectedProject === "all") {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<button class="primary" aria-label="Create project">+ New Project</button>`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<button class="ghost" aria-label="Back to projects">← Projects</button>`);
    }
    $$renderer2.push(`<!--]--></div></header> <main id="main-content">`);
    if (cardManager.isLoading || projectManager.isLoading) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<p>Loading...</p>`);
    } else {
      $$renderer2.push("<!--[!-->");
      if (projectManager.selectedProject === "all") {
        $$renderer2.push("<!--[-->");
        ProjectsList($$renderer2);
      } else {
        $$renderer2.push("<!--[!-->");
        if (projectManager.selectedProject === "create") {
          $$renderer2.push("<!--[-->");
          ProjectCreate($$renderer2);
        } else {
          $$renderer2.push("<!--[!-->");
          ProjectDetail($$renderer2, { projectId: projectManager.selectedProject });
        }
        $$renderer2.push(`<!--]-->`);
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--></main></div>`);
  });
}
export {
  _page as default
};
