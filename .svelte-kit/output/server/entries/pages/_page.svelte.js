import { b as attr, a as attr_class, e as ensure_array_like, h as head } from "../../chunks/index2.js";
import "clsx";
import { X as escape_html } from "../../chunks/context.js";
import "../../chunks/modalStore.js";
import "dompurify";
import "markdown-it";
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
    if (typeof window === "undefined" || !("api" in window)) {
      return;
    }
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
    if (typeof window === "undefined" || !("api" in window)) {
      return;
    }
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
   * Update an existing card
   */
  async updateCard(payload) {
    if (typeof window === "undefined" || !("api" in window)) {
      return;
    }
    try {
      const updated = await window.api.updateCard(payload);
      const index = this.all.findIndex((c) => c.id === payload.id);
      if (index !== -1) {
        this.all[index] = updated;
      }
      return updated;
    } catch (err) {
      console.error("Failed to update card:", err);
      throw err;
    }
  }
  /**
   * Delete a card
   */
  async deleteCard(id) {
    if (typeof window === "undefined" || !("api" in window)) {
      return;
    }
    try {
      await window.api.deleteCard(id);
      this.all = this.all.filter((c) => c.id !== id);
    } catch (err) {
      console.error("Failed to delete card:", err);
      throw err;
    }
  }
  /**
   * Update card status
   */
  async updateCardStatus(id, status) {
    if (typeof window === "undefined" || !("api" in window)) {
      return;
    }
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
    if (typeof window === "undefined" || !("api" in window)) {
      return;
    }
    try {
      await window.api.runPrompt(prompt);
    } catch (err) {
      console.error("Failed to run prompt:", err);
      throw err;
    }
  }
  /**
   * Run a card's prompt with optional system prompt in ChatGPT
   * System prompt will be prepended to the user prompt
   */
  async runPromptWithSystem(userPrompt, systemPrompt) {
    if (typeof window === "undefined" || !("api" in window)) {
      return;
    }
    let combinedPrompt = userPrompt;
    if (systemPrompt?.trim()) {
      combinedPrompt = `${systemPrompt.trim()}

${userPrompt}`;
    }
    try {
      await window.api.runPrompt(combinedPrompt);
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
class ProjectManager {
  constructor() {
    this.all = [];
    this.isLoading = false;
    this.viewMode = "list";
    this.selectedProjectId = null;
  }
  // Derived value for backward compatibility
  get selectedProject() {
    if (this.viewMode === "list") {
      return "all";
    }
    if (this.viewMode === "create") {
      return "create";
    }
    return this.selectedProjectId || "all";
  }
  /**
   * Load all projects from Electron IPC
   */
  async loadProjects() {
    if (typeof window === "undefined" || !("api" in window)) {
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
  async createProject(name, systemPrompt) {
    const trimmed = name.trim();
    if (!trimmed) {
      throw new Error("Project name is required");
    }
    if (typeof window === "undefined" || !("api" in window)) {
      throw new Error("Window API not available - preload may not have loaded");
    }
    const created = await window.api.createProject({ name: trimmed, systemPrompt });
    this.all = [...this.all, created].sort((a, b) => a.name.localeCompare(b.name));
    return created;
  }
  /**
   * Select "All Projects" view
   */
  selectAll() {
    this.viewMode = "list";
    this.selectedProjectId = null;
    cardManager.setFilterProject("all");
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
      cardManager.setFilterProject("all");
      return;
    }
    this.viewMode = "detail";
    this.selectedProjectId = id;
    cardManager.setFilterProject(id);
  }
  /**
   * Show project creation form
   */
  selectCreateProject() {
    this.viewMode = "create";
    this.selectedProjectId = null;
    cardManager.setFilterProject("all");
  }
  /**
   * Update an existing project
   */
  async updateProject(payload) {
    if (!payload.id || !payload.name.trim()) {
      throw new Error("Project ID and name are required");
    }
    if (typeof window === "undefined" || !("api" in window)) {
      throw new Error("Window API not available");
    }
    const updated = await window.api.updateProject(payload);
    const index = this.all.findIndex((p) => p.id === payload.id);
    if (index !== -1) {
      this.all[index] = updated;
      this.all.sort((a, b) => a.name.localeCompare(b.name));
    }
    return updated;
  }
  /**
   * Delete a project
   */
  async deleteProject(id) {
    if (!id) {
      throw new Error("Project ID is required");
    }
    if (typeof window === "undefined" || !("api" in window)) {
      throw new Error("Window API not available");
    }
    await window.api.deleteProject(id);
    this.all = this.all.filter((p) => p.id !== id);
    if (this.selectedProjectId === id) {
      this.selectAll();
    }
  }
  /**
   * Find project by ID
   */
  findById(id) {
    return this.all.find((p) => p.id === id);
  }
}
const projectManager = new ProjectManager();
function ProjectCreate($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const { oncreated } = $$props;
    let formData = { name: "", systemPrompt: "" };
    let _isSubmitting = false;
    let fieldErrors = {};
    const _descriptionIds = fieldErrors.name ? "name-error project-hint" : "project-hint";
    $$renderer2.push(`<section class="project-create svelte-t06kqd"><h2 class="svelte-t06kqd">Create project</h2> <form${attr("aria-describedby", _descriptionIds)} class="project-form svelte-t06kqd"><label for="proj-name" class="svelte-t06kqd">Project name</label> <input id="proj-name"${attr("value", formData.name)} type="text" placeholder="e.g. JavaScript"${attr("aria-invalid", fieldErrors.name ? "true" : "false")}${attr("disabled", _isSubmitting, true)}${attr_class("svelte-t06kqd", void 0, { "error": fieldErrors.name })}/> `);
    if (fieldErrors.name) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<p id="name-error" class="field-error svelte-t06kqd" role="alert">${escape_html(fieldErrors.name)}</p>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> <p class="hint svelte-t06kqd" id="project-hint">The project name appears in the sidebar list.</p> <label for="proj-system-prompt" class="svelte-t06kqd">System prompt <span class="optional">(optional)</span></label> <textarea id="proj-system-prompt" placeholder="e.g. You are an expert JavaScript developer. Always provide code examples and explain best practices."${attr("aria-invalid", fieldErrors.systemPrompt ? "true" : "false")}${attr("disabled", _isSubmitting, true)} rows="4"${attr_class("", void 0, { "error": fieldErrors.systemPrompt })}>`);
    const $$body = escape_html(formData.systemPrompt);
    if ($$body) {
      $$renderer2.push(`${$$body}`);
    }
    $$renderer2.push(`</textarea> `);
    if (fieldErrors.systemPrompt) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<p id="system-prompt-error" class="field-error svelte-t06kqd" role="alert">${escape_html(fieldErrors.systemPrompt)}</p>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> <p class="hint svelte-t06kqd" id="system-prompt-hint">This prompt will be prepended to all learning cards in this project when sent to ChatGPT.</p> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> <div class="actions svelte-t06kqd"><button type="submit" class="primary svelte-t06kqd"${attr("disabled", _isSubmitting, true)}>${escape_html("Create project")}</button> <button type="button" class="ghost svelte-t06kqd"${attr("disabled", _isSubmitting, true)}>Cancel</button></div></form></section>`);
  });
}
function MoreMenu($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const { $$slots, $$events, ...props } = $$props;
    let ariaLabel = "";
    $$renderer2.push(`<details class="more-menu svelte-rmjvfi"><summary class="more-trigger svelte-rmjvfi"${attr(
      "aria-label",
      // when the disclosure opens, focus first actionable item
      ariaLabel
    )}><span aria-hidden="true">⋮</span></summary> <div class="menu svelte-rmjvfi" role="menu"><button type="button" role="menuitem" class="svelte-rmjvfi">Edit</button> <button type="button" role="menuitem" class="danger svelte-rmjvfi">Delete</button></div></details>`);
  });
}
function CardItem($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const { $$slots, $$events, ...props } = $$props;
    let card = props.card;
    props.onStart;
    props.onToggle;
    props.onEdit;
    props.onDelete;
    props.noteApi;
    const isDone = (() => card.status === "done")();
    (() => card.status === "done" ? "Mark active" : "Mark done")();
    (() => card.status === "done" ? "✓ Completed" : "Active")();
    (() => {
      if (!card.project) return "";
      return projectManager.all.find((p) => p.id === card.project)?.name || card.project;
    })();
    let _buttonLabel = "";
    let _statusText = "";
    let _projectName = "";
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
      $$renderer2.push(`<p class="project">Project: <strong>${escape_html(_projectName)}</strong></p>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></header> <section><div${attr_class("status svelte-ybr5in", void 0, { "done": isDone })}>${escape_html(_statusText)}</div> <pre class="prompt">${escape_html(card.prompt)}</pre></section> <footer class="card-actions"><button type="button" class="primary"${attr("aria-label", `Start chat with prompt for ${card.title}`)}>Start in ChatGPT</button> <label class="check svelte-ybr5in"><input type="checkbox"${attr("checked", isDone, true)}${attr("aria-label", isDone ? `Mark ${card.title} as active` : `Mark ${card.title} as done`)} class="svelte-ybr5in"/> <span class="check-label svelte-ybr5in">${escape_html(_buttonLabel)}</span></label> <button type="button" class="secondary open-notes"${attr("aria-label", `Open notes for ${card.title}`)}>Open Notes</button> `);
    MoreMenu($$renderer2, { ariaLabel: `More actions for ${card.title}` });
    $$renderer2.push(`<!----></footer></article>`);
  });
}
function CardList($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const {
      onStart: _onStart,
      onToggle: _onToggle,
      onEdit: _onEdit,
      onDelete: _onDelete
    } = $$props;
    function groupByProject(list) {
      const map = /* @__PURE__ */ new Map();
      for (const c of list) {
        const key = c.project || "";
        if (!map.has(key)) map.set(key, []);
        map.get(key)?.push(c);
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
    const _groupedCards = (() => {
      if (cardManager.filterProject === "all") {
        return groupByProject(cardManager.filtered);
      }
      return [];
    })();
    $$renderer2.push(`<section><h2>Your learning cards</h2> <div class="filters"><label class="filter">Show: <select>`);
    $$renderer2.option({ value: "all" }, ($$renderer3) => {
      $$renderer3.push(`All (${escape_html(cardManager.all.length)})`);
    });
    $$renderer2.option({ value: "active" }, ($$renderer3) => {
      $$renderer3.push(`Active (${escape_html(cardManager.activeCards.length)})`);
    });
    $$renderer2.option({ value: "done" }, ($$renderer3) => {
      $$renderer3.push(`Completed (${escape_html(cardManager.completedCards.length)})`);
    });
    $$renderer2.push(`</select></label> <label class="filter search">Search: <input type="search" placeholder="Search title, prompt, topic" aria-label="Search cards"/></label></div> <div class="card-list">`);
    if (cardManager.filtered.length === 0) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<p class="empty-state" role="status" aria-live="polite">No learning cards match your filters.</p>`);
    } else {
      $$renderer2.push("<!--[!-->");
      if (cardManager.filterProject === "all") {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<!--[-->`);
        const each_array = ensure_array_like(_groupedCards);
        for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
          let group = each_array[$$index_1];
          $$renderer2.push(`<section class="project-group"${attr("aria-labelledby", group.headingId)}><h3${attr("id", group.headingId)}>${escape_html(group.project ? projectManager.all.find((p) => p.id === group.project)?.name || group.project : "Unassigned")}</h3> <!--[-->`);
          const each_array_1 = ensure_array_like(group.cards);
          for (let $$index = 0, $$length2 = each_array_1.length; $$index < $$length2; $$index++) {
            let card = each_array_1[$$index];
            CardItem($$renderer2, {
              card,
              onStart: _onStart,
              onToggle: _onToggle,
              onEdit: _onEdit,
              onDelete: _onDelete
            });
          }
          $$renderer2.push(`<!--]--></section>`);
        }
        $$renderer2.push(`<!--]-->`);
      } else {
        $$renderer2.push("<!--[!-->");
        $$renderer2.push(`<!--[-->`);
        const each_array_2 = ensure_array_like(cardManager.filtered);
        for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
          let card = each_array_2[$$index_2];
          CardItem($$renderer2, {
            card,
            onStart: _onStart,
            onToggle: _onToggle,
            onEdit: _onEdit,
            onDelete: _onDelete
          });
        }
        $$renderer2.push(`<!--]-->`);
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--></div></section>`);
  });
}
function ProjectDetail($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const { projectId } = $$props;
    const _project = (() => {
      if (!projectManager.all || !projectId) return void 0;
      return projectManager.all.find((p) => p.id === projectId);
    })();
    async function _handleStart(card) {
      let systemPrompt;
      if (card.project) {
        const proj = projectManager.all.find((p) => p.id === card.project);
        systemPrompt = proj?.systemPrompt;
      }
      await cardManager.runPromptWithSystem(card.prompt, systemPrompt);
    }
    async function _handleCardToggle(id, status) {
      await cardManager.updateCardStatus(id, status);
    }
    let _editingCard = null;
    function _handleCardEdit(card) {
      _editingCard = card;
    }
    async function _handleEditSubmit(data) {
      await cardManager.updateCard(data);
      _editingCard = null;
    }
    function _handleEditCancel() {
      _editingCard = null;
    }
    async function _handleCardDelete(id) {
      if (window.confirm("Are you sure you want to delete this learning card?")) {
        await cardManager.deleteCard(id);
      }
    }
    $$renderer2.push(`<section class="project-detail svelte-1ykxz3w"><header><h2>${escape_html(_project ? _project.name : "Project")}</h2> <div class="actions svelte-1ykxz3w"><button class="primary" type="button">+ New Learning Item</button></div></header> `);
    if (_editingCard) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<dialog open class="modal-overlay"><div class="modal-content" aria-labelledby="edit-heading" role="document">`);
      EditCardForm($$renderer2, {
        card: _editingCard,
        onSubmit: _handleEditSubmit,
        onCancel: _handleEditCancel
      });
      $$renderer2.push(`<!----></div></dialog>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> `);
    CardList($$renderer2, {
      onStart: _handleStart,
      onToggle: _handleCardToggle,
      onEdit: _handleCardEdit,
      onDelete: _handleCardDelete
    });
    $$renderer2.push(`<!----></section>`);
  });
}
function ProjectsList($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const { onopen } = $$props;
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
        $$renderer2.push(`<li><div class="project-card-wrapper svelte-138d5ja"><button class="project-card svelte-138d5ja"${attr("aria-label", `Open project ${p.name}`)}><span class="project-name svelte-138d5ja">${escape_html(p.name)}</span></button> <div class="project-actions svelte-138d5ja">`);
        MoreMenu($$renderer2, { ariaLabel: `More actions for project ${p.name}` });
        $$renderer2.push(`<!----></div></div></li>`);
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--></ul> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></section>`);
  });
}
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    function _handleProjectCreated(detail) {
      const projectId = detail.project;
      projectManager.selectProject(projectId);
    }
    function _handleProjectFilterChange(e) {
      const select = e.target;
      const projectId = select.value;
      if (projectId === "all") {
        projectManager.selectAll();
      } else if (projectId) {
        projectManager.selectProject(projectId);
      }
    }
    head("1uha8ag", $$renderer2, ($$renderer3) => {
      $$renderer3.title(($$renderer4) => {
        $$renderer4.push(`<title>Learning Space</title>`);
      });
      $$renderer3.push(`<meta name="description" content="Finish what you start"/>`);
    });
    $$renderer2.push(`<div id="sr-announcements" class="sr-only" aria-live="polite" aria-atomic="true"></div> <div class="container"><header><h1>Learning Space</h1> <p class="subtitle">Finish what you start</p> <div class="top-actions">`);
    if (projectManager.selectedProject === "all") {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<button class="primary" aria-label="Create project">+ New Project</button>`);
    } else {
      $$renderer2.push("<!--[!-->");
      if (projectManager.selectedProject === "create") {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<button class="ghost" aria-label="Back to projects">← Projects</button>`);
      } else {
        $$renderer2.push("<!--[!-->");
        $$renderer2.push(`<div class="project-controls svelte-1uha8ag"><label class="project-filter svelte-1uha8ag">Project: `);
        $$renderer2.select(
          {
            value: projectManager.selectedProject,
            onchange: _handleProjectFilterChange,
            "aria-label": "Switch project",
            class: ""
          },
          ($$renderer3) => {
            $$renderer3.option({ value: "all" }, ($$renderer4) => {
              $$renderer4.push(`All projects`);
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
          },
          "svelte-1uha8ag"
        );
        $$renderer2.push(`</label> <button class="ghost" aria-label="Back to projects">← Projects</button></div>`);
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--></div></header> <main id="main-content">`);
    if (cardManager.isLoading || projectManager.isLoading) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<p>Loading...</p>`);
    } else {
      $$renderer2.push("<!--[!-->");
      if (projectManager.selectedProject === "all") {
        $$renderer2.push("<!--[-->");
        ProjectsList($$renderer2, { onopen: (e) => projectManager.selectProject(e.projectId) });
      } else {
        $$renderer2.push("<!--[!-->");
        if (projectManager.selectedProject === "create") {
          $$renderer2.push("<!--[-->");
          ProjectCreate($$renderer2, { oncreated: _handleProjectCreated });
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
