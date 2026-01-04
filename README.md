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

Packaging & Releases

- Build locally: `npm run package` will produce platform-specific installers (run on the target OS).
  -- CI / multi-arch: a GitHub Actions workflow is included at `.github/workflows/release.yml` that runs on tag pushes (v\*). Set `GITHUB_TOKEN` / repo secrets and update the `build.publish` owner/repo fields in `package.json` before using.
- To publish from CI, push a tag like `v0.1.0` and the workflow will run `electron-builder` to create and publish artifacts to GitHub Releases.
- Note: macOS builds are no longer produced by this project; CI will build for Windows and Linux only.

License
Apache-2.0 © 2026 Learning Cards contributors
