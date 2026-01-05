# Learning Space AI

> **A local-first, accessible desktop app for organizing learning prompts and launching them in ChatGPT.**

Learning Space AI helps you **capture, organize, and complete AI prompts used for learning**, with a single supported launch target: **ChatGPT in your default web browser**.

The app stores prompts locally and provides intentional structure so learning prompts don’t get lost, duplicated, or mentally overwhelming.

---

## What Problem This Solves

People learning with AI often face:

- Prompts scattered across chat histories and notes
- No clear system to organize prompts by learning context
- Repeating prompts without knowing what was already learned
- No sense of completion or closure

**Learning Space AI solves prompt organization for learning—nothing more, nothing less.**

---

## Scope (Very Explicit)

### ✅ What This App Does

- Stores **AI prompts for learning** as structured learning cards
- Organizes prompts by **projects (learning contexts)**
- Launches prompts **only in ChatGPT**
- Opens ChatGPT in the **user’s default browser**
- Helps users mark learning as **completed**

### ❌ What This App Does Not Do

- It does **not** store AI responses
- It does **not** send prompts automatically
- It does **not** embed ChatGPT
- It does **not** support multiple AI providers
- It does **not** act as a chat client

---

## Core Workflow

1. Create a **Learning Card** containing an AI prompt
2. Assign it to a **Project** (topic, course, or goal)
3. Click **“Start learning with ChatGPT”**
4. The app:
   - Opens ChatGPT in your **default browser**
   - Prefills the chat input with your stored prompt
   - Leaves final control to you (you click _Send_)

5. After learning, return and **mark the card as completed**

This design preserves **user agency**, transparency, and accessibility.

---

## Learning Card Actions

Each learning card provides two primary actions:

### ▶️ Start Learning with ChatGPT

- Opens `chat.openai.com` in the user’s default browser
- Prefills the chat input with the stored prompt
- User manually sends the prompt
- No background automation or hidden execution

### ✅ Mark as Completed

- Explicitly marks the learning intent as finished
- Helps reduce mental clutter
- Separates active learning from completed understanding

---

## Features

### 📝 Learning Cards

- Prompt-first design
- Title, prompt, topic, and project assignment
- Clear active vs completed state
- Accessible form validation with helpful feedback

### 📂 Project Organization

- Group prompts by learning context
- Project switcher for focused views
- Default project assignment for new cards

### 🔍 Search & Filters

- Search across titles, prompts, topics, and projects
- Filter by status (all / active / completed)
- Grouped views with counts

### ♿ Accessibility

- Full keyboard navigation
- Screen reader–friendly semantics
- Clear focus indicators
- No reliance on color alone
- Minimal cognitive load UI

---

## Design Principles

- **Prompts are learning artifacts**, not disposable text
- **Completion matters** for learning
- **User intent stays explicit**
- **Accessibility is non-negotiable**
- **Local-first by default**
- **No silent automation**

---

## Technology Stack

- **Desktop:** Electron
- **UI:** Svelte 5 + SvelteKit
- **Language:** TypeScript
- **State:** Svelte runes (`$state`, `$derived`, `$effect`)
- **Storage:** LowDB (local JSON)
- **Build:** Vite, esbuild
- **Packaging:** electron-builder

---

## Installation

### Prerequisites

- Node.js 18+
- npm

### Setup

```bash
git clone https://github.com/your-org/learning-space-ai.git
cd learning-space-ai
npm install
```

### Development

```bash
# Run SvelteKit UI
npm run dev

# Build the app
npm run build

# Start Electron
npm start
```

---

## Project Structure

```
learning-space-ai/
├── src/
│   ├── main.ts          # Electron main process
│   ├── preload.ts       # Secure IPC bridge
│   ├── db.ts            # Local storage
│   ├── types.ts         # Shared TypeScript types
│   ├── lib/
│   │   ├── cardManager.svelte.ts
│   │   ├── projectManager.svelte.ts
│   │   └── components/
│   └── routes/
├── dist/                # Electron build output
├── build/               # SvelteKit build output
└── package.json
```

---

## Accessibility Notes

- Uses semantic HTML wherever possible
- Native controls preferred over custom widgets
- Focus trapping for dialogs and forms
- Screen reader announcements for validation and state changes

Accessibility issues and suggestions are **strongly encouraged**.

---

## Roadmap (Intentional, Not Promised)

- Prompt templates
- Import / export learning cards
- Optional notes on completion
- Improved keyboard workflows

Multi-AI-provider support is **out of scope for now**.

---

## Contributing

Contributions are welcome—especially around:

- Accessibility improvements
- UX clarity
- Prompt-focused workflows
- Documentation

### Guidelines

1. Fork the repository
2. Create a feature branch
3. Run checks before committing:

   ```bash
   npm run check
   ```

4. Keep changes focused and intentional
5. Open a Pull Request with context

---

## License

Apache-2.0 © 2026 Learning Space AI Contributors

---

## One-Line Philosophy

> **Learning Space AI helps you organize learning prompts and intentionally finish learning—using ChatGPT, on your terms.**
