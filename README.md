# Learning Space AI
> **Your local-first workspace for intentional learning with ChatGPT.**
**Learning Space AI** brings order to your AI learning journey. Instead of getting lost in scattered browser tabs and endless chat histories, plan your prompts locally, organize them by project, and capture your key takeaways—all in one accessible desktop app.
---
## 🚀 Why use this?
Learning with AI is powerful, but it often feels chaotic.
* **The Problem:** You have 50 tabs open, you lose track of good prompts, and you forget what you've already finished.
* **The Solution:** A dedicated workspace to **curate your prompts** before you chat, and **document your knowledge** after you chat.
**Note:** This app respects your privacy and agency. It does **not** automate the chatting process or store your chat history. It launches your default browser, pre-fills your prompt, and lets *you* control the conversation.
---
## ✨ Features
* **📂 Project Organization:** Group your learning goals (e.g., "Learn Rust", "Cooking Basics").
* **📝 Learning Cards:** Write specific prompts to target concepts one at a time.
* **▶️ One-Click Launch:** Instantly **redirects to your default web browser** and opens ChatGPT with your prompt pre-filled and ready to go.
* **📓 Integrated Notes:** Capture markdown-formatted notes for every card without leaving the app.
* **✅ Progress Tracking:** Mark concepts as "Done" to visualize your learning path.
* **🤖 AI Curriculum Generation:** Ask ChatGPT to generate a study plan and import it directly into the app.
* **🔒 Local-First:** Your data lives on your machine (JSON). No accounts, no clouds.
* **♿ Accessible:** Built from the ground up for screen readers and keyboard navigation.
---
## 📖 User Guide
### 1. The Learning Loop
1.  **Create a Project:** Give it a name (e.g., *Advanced React*).
2.  **Add a Card:** Write a short title and the specific prompt you want to ask AI.
3.  **Launch:** Click **Start Chat** (▶️).
    * *Action:* The app **redirects you to your default web browser** and opens ChatGPT.
4.  **Learn & Note:** Read the AI response in your browser, then switch back to the app and click **Open Notes** (📝) to write down your summary.
5.  **Complete:** Check the box to mark the card as **Done**.
### 2. Generating Plans with AI
Don't know where to start?
1.  Click **🤖 Generate** in the project header.
2.  Follow the instructions to get a JSON study plan from ChatGPT.
3.  Copy the code block and use the **📥 Import** button to load the cards instantly.
### 3. Data Management
* **Export:** Backup your projects to \.json\ files via the **Export** button.
* **Import:** Restore backups or import shared learning lists.
> 📚 **Need more details?**
> Check out the [Complete User Guide & UI Manual](docs/USER_GUIDE.md) for advanced workflows, JSON schemas, and troubleshooting.
---
## 📥 Installation
### Windows & Linux
Download the latest installer from the [Releases Page](https://github.com/adil-adysh/learning-space-ai/releases).
### macOS
*Coming soon.*
---
## 🛠️ For Developers
Interested in contributing? Learning Space AI is built with **Electron**, **Svelte 5**, and **TypeScript**.
### Project Structure
* **\src/main.ts\**: Electron main process.
* **\src/lib/\**: Svelte 5 UI components and Rune-based state management (\*.svelte.ts\).
* **\src/db.ts\**: Local JSON storage (LowDB).
### Development Setup
1.  **Prerequisites:** Node.js 18+ and npm.
2.  **Clone & Install:**
    \\\ash
    git clone https://github.com/adil-adysh/learning-space-ai.git
    cd learning-space-ai
    npm install
    \\\
3.  **Run in Dev Mode:**
    \\\ash
    # Starts Vite server + Electron
    npm run dev
    \\\
4.  **Run Tests:**
    \\\ash
    # Unit & Component tests via Vitest
    npm test
    \\\
5.  **Build for Production:**
    \\\ash
    npm run build
    # Packages the app to /dist
    \\\
### Contributing Guidelines
* We use **Svelte 5 Runes** (\$state\, \$derived\, \$effect\). Please stick to modern Svelte patterns.
* **Accessibility is mandatory.** All interactive elements must be keyboard navigable and labeled for screen readers.
* Run \
pm run lint\ and \
pm test\ before submitting a PR.
---
## 📄 License
Apache-2.0 © 2026 Learning Space AI Contributors
