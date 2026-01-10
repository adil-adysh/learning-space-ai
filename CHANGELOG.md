# Changelog
All notable changes to **Learning Space AI** will be documented in this file.
## [Unreleased] (Upcoming v0.0.7)
* **Documentation:**
    * Updated README.md with a comprehensive User Guide and clearer structure.
    * Added docs/USER_GUIDE.md for deep-dive instructions on workflows.
    * Added repository metadata to package.json.
## [v0.0.6] - 2026-01-10
### ✨ New Features
* **AI Generation:** Added "Generate Learning Cards" button. Opens a pre-filled ChatGPT prompt to create study plans.
* **Data Portability (Import/Export):**
    * Added **Export** modal to backup projects to .json.
    * Added **Import** modal with file upload and JSON paste support.
    * Implemented "Fail-Fast" validation for imports to prevent data corruption.
* **Note Management:** Full CRUD (Create, Read, Update, Delete) support for Notes.
* **Markdown Rendering:** Notes now render sanitized Markdown (Bold, Lists, Code) in the NoteView component.
### 🛠 Improvements
* **UI Clarity:** Updated button labels for AI generation to make actions more predictable.
* **Testing:** Added comprehensive unit and UI tests for:
    * Import file-upload flows.
    * Note CRUD operations.
    * Markdown rendering verification.
* **Code Quality:** Standardized quotation marks and improved code formatting across the codebase.
## [v0.0.5] - 2026-01-10
### 🏗 Refactoring
* **Code Quality:** Major refactor to improve code formatting and readability across multiple components and tests.
* **Linting:** Updated package.json scripts and dependencies for stricter linting and formatting rules.
* **Cleanup:** Removed unwanted AI-generated artifacts to keep the repository clean.
## [v0.0.4] - 2026-01-05
### ✨ New Features
* **Integrated Notes UI:**
    * Added NoteContent component for rendering notes.
    * Added NoteEditorModal for writing notes.
    * Added NoteModal for viewing notes associated with a card.
* **Card Actions:** Added "More Menu" (⋮) to Learning Cards with **Edit** and **Delete** options.
* **App Entry:** Added new application entry points and updated start scripts.
### 🛠 Improvements
* **Testing:** Migrated testing framework to **Vitest**. Added tests for CardItem, NoteModal, and editing flows.
* **Build:** Updated electron-builder config to include versioning in artifact names.
## [v0.0.3] - 2026-01-05
### ⚙️ CI/CD & Infrastructure
* **CI Workflow:** Enhanced GitHub Actions with matrix testing and improved artifact handling.
* **Documentation:** Added COPILOT_INSTRUCTIONS.md and detailed Svelte 5 refactoring documentation.
* **Refactoring:** Cleaned up redundant code blocks for better maintainability.
* **UI Components:** Added accessible EditCardForm and EditProjectForm with validation.
## [v0.0.2] - 2026-01-04
### 🚀 Core Architecture
* **Svelte 5 Migration:** Complete refactor to use Svelte 5 Runes ($state, $derived) and modern patterns.
* **Project Management:** Added initial Project and Card management logic.
* **Build System:**
    * Fixed CommonJS output configuration for Electron compatibility.
    * Streamlined lectron-builder config generation.
    * Added build scripts for import patching.
## [v0.0.1] - 2026-01-04
### 🎉 Initial Release
* **Base Features:**
    * Initial commit of the Learning Space AI application.
    * Centralized AppStateManager.
    * Basic filtering for Learning Cards.
* **Release Automation:**
    * Configured release workflow with artifact deduplication and caching.
    * Added Linux and Windows targets to electron-builder configuration.
