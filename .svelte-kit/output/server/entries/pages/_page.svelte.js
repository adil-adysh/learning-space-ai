import { b as attr, a as attr_class, e as ensure_array_like, h as head } from "../../chunks/index2.js";
import "clsx";
import { X as escape_html } from "../../chunks/context.js";
import "../../chunks/modalStore.js";
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
    if (submissionError) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<p class="submission-error svelte-t06kqd" role="alert">${escape_html(submissionError)}</p>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> <div class="actions svelte-t06kqd"><button type="submit" class="primary svelte-t06kqd"${attr("disabled", _isSubmitting, true)}>${escape_html("Create project")}</button> <button type="button" class="ghost svelte-t06kqd"${attr("disabled", _isSubmitting, true)}>Cancel</button></div></form></section>`);
  });
}
function ProjectDetail($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const { projectId } = $$props;
    (() => {
      if (!projectManager.all || !projectId) return void 0;
      return projectManager.all.find((p) => p.id === projectId);
    })();
    $$renderer2.push(`<section class="project-detail svelte-1ykxz3w"><header><h2>${escape_html(project ? project.name : "Project")}</h2> <div class="actions svelte-1ykxz3w"><button class="primary" type="button">+ New Learning Item</button></div></header> `);
    if (editingCard) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<dialog open class="modal-overlay"><div class="modal-content" aria-labelledby="edit-heading" role="document">`);
      EditCardForm($$renderer2, {
        card: editingCard,
        onSubmit: handleEditSubmit,
        onCancel: handleEditCancel
      });
      $$renderer2.push(`<!----></div></dialog>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> `);
    CardList($$renderer2, {
      onStart: handleStart,
      onToggle: handleCardToggle,
      onEdit: handleCardEdit,
      onDelete: handleCardDelete
    });
    $$renderer2.push(`<!----></section>`);
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
