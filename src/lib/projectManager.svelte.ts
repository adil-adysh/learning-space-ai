import type { Project } from '../types';

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
  async createProject(name: string): Promise<Project> {
    const trimmed = name.trim();
    if (!trimmed) {
      throw new Error('Project name is required');
    }

    if (typeof window === 'undefined' || !('api' in window)) {
      throw new Error('Window API not available - preload may not have loaded');
    }

    const created: Project = await (
      window as typeof window & { api: typeof window.api }
    ).api.createProject(trimmed);
    this.all = [...this.all, created].sort((a, b) => a.name.localeCompare(b.name));
    return created;
  }

  /**
   * Select "All Projects" view
   */
  selectAll() {
    this.viewMode = 'list';
    this.selectedProjectId = null;
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
      return;
    }
    this.viewMode = 'detail';
    this.selectedProjectId = id;
  }

  /**
   * Show project creation form
   */
  selectCreateProject() {
    this.viewMode = 'create';
    this.selectedProjectId = null;
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
