import type { Project } from '../types';
import { cardManager } from './cardManager.svelte';

/**
 * Project Manager using Svelte 5 Runes
 * Universal reactive state that works across components and outside .svelte files
 */
class ProjectManager {
  // Reactive state using $state rune
  all = $state<Project[]>([]);
  isLoading = $state(false);

  // View mode state
  viewMode = $state<'list' | 'create' | 'detail'>('list');
  selectedProjectId = $state<string | null>(null);

  // Derived value for backward compatibility
  get selectedProject(): string {
    if (this.viewMode === 'list') {
      return 'all';
    }
    if (this.viewMode === 'create') {
      return 'create';
    }
    return this.selectedProjectId || 'all';
  }

  /**
   * Load all projects from Electron IPC
   */
  async loadProjects() {
    if (typeof window === 'undefined' || !('api' in window)) {
      console.warn('Window API not available, skipping project load');
      return;
    }

    this.isLoading = true;
    try {
      const list: Project[] = await (
        window as typeof window & { api: typeof window.api }
      ).api.getProjects();
      if (Array.isArray(list)) {
        this.all = list.slice().sort((a, b) => a.name.localeCompare(b.name));
      }
    } catch (err) {
      console.error('Failed to load projects from main process', err);
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Create a new project
   */
  async createProject(name: string, systemPrompt?: string): Promise<Project> {
    const trimmed = name.trim();
    if (!trimmed) {
      throw new Error('Project name is required');
    }

    if (typeof window === 'undefined' || !('api' in window)) {
      throw new Error('Window API not available - preload may not have loaded');
    }

    const created: Project = await (
      window as typeof window & { api: typeof window.api }
    ).api.createProject({ name: trimmed, systemPrompt });
    this.all = [...this.all, created].sort((a, b) => a.name.localeCompare(b.name));
    return created;
  }

  /**
   * Select "All Projects" view
   */
  selectAll() {
    this.viewMode = 'list';
    this.selectedProjectId = null;
    cardManager.setFilterProject('all');
  }

  /**
   * Select a specific project by ID
   */
  selectProject(id: string | null) {
    if (id === null || id === 'all') {
      this.selectAll();
      return;
    }
    if (id === 'create') {
      this.viewMode = 'create';
      this.selectedProjectId = null;
      cardManager.setFilterProject('all');
      return;
    }
    this.viewMode = 'detail';
    this.selectedProjectId = id;
    cardManager.setFilterProject(id);
  }

  /**
   * Show project creation form
   */
  selectCreateProject() {
    this.viewMode = 'create';
    this.selectedProjectId = null;
    cardManager.setFilterProject('all');
  }

  /**
   * Update an existing project
   */
  async updateProject(payload: {
    id: string;
    name: string;
    systemPrompt?: string;
  }): Promise<Project> {
    if (!payload.id || !payload.name.trim()) {
      throw new Error('Project ID and name are required');
    }

    if (typeof window === 'undefined' || !('api' in window)) {
      throw new Error('Window API not available');
    }

    const updated: Project = await (
      window as typeof window & { api: typeof window.api }
    ).api.updateProject(payload);

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
  async deleteProject(id: string): Promise<void> {
    if (!id) {
      throw new Error('Project ID is required');
    }

    if (typeof window === 'undefined' || !('api' in window)) {
      throw new Error('Window API not available');
    }

    await (window as typeof window & { api: typeof window.api }).api.deleteProject(id);
    this.all = this.all.filter((p) => p.id !== id);

    // If viewing this project, go back to all projects
    if (this.selectedProjectId === id) {
      this.selectAll();
    }
  }

  /**
   * Find project by ID
   */
  findById(id: string): Project | undefined {
    return this.all.find((p) => p.id === id);
  }
}

// Export singleton instance
export const projectManager = new ProjectManager();
