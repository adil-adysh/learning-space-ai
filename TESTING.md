Testing & Browser-mode Vitest Setup

This project uses a single `vitest.config.ts` with explicit `unit` (Node) and `browser` (Browser Mode + Playwright) projects so components run inside Chromium via `vitest-browser-svelte`.

Follow the steps below to reproduce the environment that CI expects.

1) Clean the existing node artifacts (PowerShell):

```powershell
Remove-Item -Recurse -Force node_modules, package-lock.json
npm cache clean --force
```

2) Restore dependencies with the pinned lockfile:

```powershell
npm install --no-audit --no-fund --yes
```

3) Install Playwright browsers (Chromium) once per machine:

```powershell
npx playwright install --with-deps chromium
```

4) Run the tests (unit + browser projects):

```powershell
npm run test:ci
```

To exercise a single project, use the same config file directly:

```powershell
npx vitest -c vitest.config.ts --project browser --run --browser.headless
npx vitest -c vitest.config.ts --project unit --run
```

Notes & troubleshooting
- The config now lives in `vitest.config.ts`; it loads the SvelteKit plugin, sets up `src/setupTests.ts`, and wires the Playwright provider factory via `@vitest/browser-playwright`.
- If Playwright installation fails on Windows, run the `npx playwright install --with-deps chromium` command from an elevated PowerShell window.
- CI runners (GitHub Actions ubuntu-latest, Azure basically any Linux/macOS) already support headless Chromium; ensure display/session access when using custom runners.