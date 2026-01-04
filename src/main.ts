import { app, BrowserWindow, ipcMain, shell } from 'electron';
import * as path from 'path';
import { randomUUID } from 'crypto';
import { promises as fs } from 'fs';
import type { Server } from 'http';
import { createServer } from 'http';
import type { RawCard, Status } from './types';
import {
  initDatabase,
  readCards,
  addCard as dbAddCard,
  updateCard,
  readProjects,
  addProject as dbAddProject,
  updateProject as dbUpdateProject,
  deleteProject as dbDeleteProject,
  findProjectByName,
  clearProjectFromCards,
} from './db';
import { buildChatGPTUrl } from './util';
const STATIC_PORT = Number(process.env.STATIC_PORT) || 4173;
const BUILD_DIR = path.join(__dirname, '..', 'build');
let staticServer: Server | null = null;

let mainWindow: BrowserWindow | null = null;

async function startStaticServer() {
  if (staticServer) {
    return;
  }

  staticServer = createServer(async (req, res) => {
    const url = new URL(req.url ?? '/', 'http://localhost');
    const pathname = decodeURIComponent(url.pathname);
    const normalized = path.normalize(path.join(BUILD_DIR, pathname));
    let target = normalized;

    if (!target.startsWith(BUILD_DIR)) {
      target = path.join(BUILD_DIR, 'index.html');
    }

    try {
      const stat = await fs.stat(target);
      if (stat.isDirectory()) {
        target = path.join(target, 'index.html');
      }
    } catch {
      target = path.join(BUILD_DIR, 'index.html');
    }

    const ext = path.extname(target);
    res.setHeader('Content-Type', getMime(ext));

    try {
      const data = await fs.readFile(target);
      res.writeHead(200);
      res.end(data);
    } catch {
      const fallback = await fs.readFile(path.join(BUILD_DIR, 'index.html'));
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(fallback);
    }
  });

  await new Promise<void>((resolve) => {
    staticServer!.listen(STATIC_PORT, '127.0.0.1', () => resolve());
  });
}

function getMime(ext: string) {
  switch (ext) {
    case '.js':
      return 'application/javascript';
    case '.css':
      return 'text/css';
    case '.json':
      return 'application/json';
    case '.svg':
      return 'image/svg+xml';
    case '.woff2':
      return 'font/woff2';
    case '.woff':
      return 'font/woff';
    case '.ttf':
      return 'font/ttf';
    default:
      return 'text/html';
  }
}

function createWindow() {
  // Construct preload path - __dirname in esbuild context points to dist directory
  const preloadPath = path.join(__dirname, 'preload.cjs');
  console.log('[main] Loading preload from:', preloadPath);

  const win = new BrowserWindow({
    width: 900,
    height: 700,
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow = win;
  win.on('closed', () => {
    mainWindow = null;
  });

  // Debug: Log when preload is loaded
  win.webContents.on('preload-error', (event, processType, error) => {
    console.error('[main] Preload error:', processType, error);
  });

  // Load the SvelteKit build output via local server to avoid file:// 404s
  const targetUrl = `http://127.0.0.1:${STATIC_PORT}`;
  void win.loadURL(targetUrl);

  // Debug: Check if preload loaded
  win.webContents.on('dom-ready', () => {
    console.log('[main] DOM ready, checking if API is available...');
    void win.webContents.executeJavaScript(
      "console.log('[renderer] window.api available:', typeof window.api !== 'undefined')"
    );
  });

  // Security: open external links in user's default browser and prevent in-app navigation
  win.webContents.setWindowOpenHandler(({ url }) => {
    void shell.openExternal(url);
    return { action: 'deny' };
  });

  win.webContents.on('will-navigate', (event, url) => {
    if (!url.startsWith('file:')) {
      event.preventDefault();
      void shell.openExternal(url);
    }
  });
}

// Ensure single instance for a cleaner UX
if (!app.requestSingleInstanceLock()) {
  app.quit();
}

app.on('second-instance', () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) {
      mainWindow.restore();
    }
    mainWindow.focus();
  }
});

app.whenReady().then(async () => {
  await startStaticServer();

  // Initialize the lowdb database
  const userDataPath = app.getPath('userData');
  await initDatabase(userDataPath);

  ipcMain.handle('cards:get', async () => {
    return await readCards();
  });

  ipcMain.handle(
    'cards:add',
    async (_ev, data: { title: string; prompt: string; topic?: string; project?: string }) => {
      if (!data || typeof data.title !== 'string' || typeof data.prompt !== 'string') {
        throw new Error('Invalid input');
      }

      let projectId = (data.project || '').trim();
      if (projectId) {
        // if provided value matches a project name, resolve to id
        const foundByName = await findProjectByName(projectId);
        if (foundByName) {
          projectId = foundByName.id;
        } else {
          // Check if it's an existing project id
          const projects = await readProjects();
          const existsById = projects.find((p) => p.id === projectId);
          if (!existsById) {
            // Create new project
            const newProj = {
              id: randomUUID(),
              name: projectId,
              createdAt: new Date().toISOString(),
            };
            await dbAddProject(newProj);
            projectId = newProj.id;
          }
        }
      }

      const newCard: RawCard = {
        id: randomUUID(),
        title: data.title,
        prompt: data.prompt,
        topic: data.topic || '',
        project: projectId || '',
        status: 'active',
        createdAt: new Date().toISOString(),
      };

      return await dbAddCard(newCard);
    }
  );

  // Projects CRUD IPC
  ipcMain.handle('projects:list', async () => {
    return await readProjects();
  });

  ipcMain.handle('projects:get', async (_ev, id: string) => {
    const projects = await readProjects();
    return projects.find((p) => p.id === id) || null;
  });

  ipcMain.handle('projects:create', async (_ev, name: string) => {
    const n = (name || '').trim();
    if (!n) {
      throw new Error('Invalid project name');
    }

    // prevent duplicate names
    const existing = await findProjectByName(n);
    if (existing) {
      return existing;
    }

    const newProj = { id: randomUUID(), name: n, createdAt: new Date().toISOString() };
    return await dbAddProject(newProj);
  });

  ipcMain.handle('projects:update', async (_ev, payload: { id: string; name: string }) => {
    const id = (payload.id || '').trim();
    const name = (payload.name || '').trim();
    if (!id || !name) {
      throw new Error('Invalid input');
    }

    const updated = await dbUpdateProject(id, { name });
    if (!updated) {
      throw new Error('Project not found');
    }

    return updated;
  });

  ipcMain.handle('projects:delete', async (_ev, id: string) => {
    const removed = await dbDeleteProject(id);
    if (!removed) {
      throw new Error('Project not found');
    }

    // Remove project references from cards
    try {
      await clearProjectFromCards(id);
    } catch (err) {
      console.error('Failed to cleanup card project references', err);
    }

    return removed;
  });

  ipcMain.handle('cards:toggle', async (_ev, args: { id: string; status: Status }) => {
    const { id, status } = args;
    const updated = await updateCard(id, { status });
    if (!updated) {
      throw new Error('Card not found');
    }
    return updated;
  });

  ipcMain.handle('cards:run', async (_ev, prompt: string) => {
    if (typeof prompt !== 'string') {
      throw new Error('Invalid prompt');
    }
    const url = buildChatGPTUrl(prompt);
    if (!url.startsWith('https://chat.openai.com/')) {
      throw new Error('Blocked external URL');
    }
    await shell.openExternal(url);
    return true;
  });

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  if (staticServer) {
    staticServer.close();
    staticServer = null;
  }
});
