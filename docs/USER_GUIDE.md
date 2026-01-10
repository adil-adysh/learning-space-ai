# Learning Space AI - User Guide
## Getting Started
**Learning Space AI** is designed to help you focus. Instead of keeping 50 browser tabs open with half-finished ChatGPT conversations, this app lets you plan your learning prompts first, then execute them one by one.
### Core Concepts
1.  **Projects:** These are your "Containers." Think of them as a Course, a Book you are reading, or a specific Goal (e.g., "Learn Rust Basics").
2.  **Learning Cards:** These are individual tasks. A card contains the specific **Prompt** you intend to send to the AI.
---
## 1. 📂 Project Management
*Located in the Sidebar and Project List.*
### Creating a Project
1.  Click the **"New Project"** button.
2.  **Name:** Enter a clear name (e.g., *Advanced React Patterns*).
3.  **System Prompt:** (Optional) Enter a custom instruction for ChatGPT (e.g., *You are an expert JavaScript developer*).
4.  Click **"Create project"**.
### Managing Projects
* **Edit:** Click the **"More actions for project..."** button (three dots) → Select **"Edit"**. You can rename the project or update the system prompt here.
* **Delete:** Select **"Delete"** from the menu to remove the project and all its cards.
---
## 2. 📝 The Learning Workflow
### Step 1: Create a Learning Card
Inside a project, click the **"+ New Learning Item"** button.
* **Title:** A short summary (e.g., *Understanding Hooks*).
* **Prompt:** The actual text you want to send to ChatGPT.
    * *Tip:* Be specific. "Explain React Hooks like I'm 5" is better than "Hooks".
* Click **"Save card"**.
### Step 2: Launch & Learn
When you are ready to learn, click the **"Start chat"** (Play icon) button on the card.
* This opens your default browser directly to ChatGPT.
* The prompt is pre-filled.
* **Note:** You must press "Send" in the browser. We do not auto-send for safety reasons.
### Step 3: Take Notes
Don't copy the whole chat history. Summarize what you learned.
1.  Click the **"Open notes"** (Document icon) button on the card.
2.  Click **"New Note"**.
3.  **Title:** Give your note a headline.
4.  **Content:** Write your notes using **Markdown**. The app supports:
    * **bold text**
    * *italic text*
    * \inline code\`
    * - list items
5.  Click **"Save"**. The note will render nicely formatted in the view.
### Step 4: Mark as Complete
Once you understand the concept:
* Click the checkbox **"Mark [Card Title] as done"**.
* The card will move to the "Completed" tab, giving you a sense of progress.
---
## 3. 🤖 AI Generation
*Located in the Project Header.*
Instead of writing cards manually, ask AI to create a study plan for you.
1.  Click **"🤖 Generate"**.
2.  This opens ChatGPT with a special system instruction.
3.  Ask ChatGPT to create a curriculum (e.g., "Create 5 cards about Rust ownership").
4.  **Copy** the JSON code block provided by ChatGPT.
5.  Use the **Import** feature (see below) to add those cards to your project.
---
## 4. 🔄 Data Management
### Importing Cards
Bring in cards from a backup or AI generation.
1.  Click **"Import"** in the project header.
2.  **Paste JSON:** Paste text directly into the box.
3.  **Upload File:** Or click "Choose File" to select a .json file.
4.  **Validate:** Click **"Validate & Preview"**.
    * *Safety:* The app checks every card for errors. If one card is invalid, the import stops to prevent data corruption.
5.  Click **"Import"** to finish.
### Exporting Cards
Back up your learning data or share it between computers.
1.  Click **"Export"** in the project header.
2.  A preview of your data (in JSON format) appears.
3.  Click **"Save / Download"** to save the file (e.g., my-project-learning-cards.json) to your computer.
---
## ♿ Accessibility Notes
* **Keyboard:** All Modals support Escape to close and Tab navigation.
* **Screen Readers:** Buttons use ria-label (e.g., "More actions for [Card Title]") to provide context to screen reader users.
* **Focus:** Focus is automatically managed when opening/closing modals to keep your place.
