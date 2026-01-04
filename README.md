Learning Cards — Electron + TypeScript MVP

A minimal desktop app to capture learning intents and run pre-filled ChatGPT prompts with one click.

Goals
- Keep the UI calm, simple, and accessible
- Single-screen workflow: create -> run -> mark completed

Quickstart

1. Install dependencies

   npm install

2. Build and run

   npm run build
   npm run start

3. Run tests

   npm test

Project structure
- src/ - TypeScript source
  - main.ts (Electron main)
  - preload.ts (secure bridge)
  - renderer.ts (UI logic)
  - types.ts
  - storage.ts, util.ts (pure helpers)
  - index.html (accessible UI)
- dist/ - compiled output

Contributing
- This project uses the Apache-2.0 license.
- Open issues or PRs with small, focused changes.
- Please run the test suite (npm test) and ensure CI passes before submitting a PR.

License
Apache-2.0 © 2026 Learning Cards contributors
