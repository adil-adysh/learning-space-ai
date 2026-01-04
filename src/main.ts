import { app, BrowserWindow, ipcMain, shell } from 'electron';
import * as path from 'path';
import { randomUUID } from 'crypto';
import { promises as fs } from 'fs';
import { createServer, Server } from 'http';
import { RawCard, Status } from './types';
import { readCardsFrom, writeCardsTo } from './storage';
import { buildChatGPTUrl } from './util';

const FILE_NAME = 'cards.json';
const STATIC_PORT = Number(process.env.STATIC_PORT) || 4173;
const BUILD_DIR = path.join(__dirname, '..', 'build');
let staticServer: Server | null = null;

let mainWindow: BrowserWindow | null = null;

function getDataPath() {
  return path.join(app.getPath('userData'), FILE_NAME);
}

async function startStaticServer() {
  if (staticServer) return;

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
    } catch (err) {
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

async function readCards(): Promise<RawCard[]> {
  return readCardsFrom(getDataPath());
}

async function writeCards(cards: RawCard[]) {
  return writeCardsTo(getDataPath(), cards);
}

function createWindow() {
  const win = new BrowserWindow({
    width: 900,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow = win;
  win.on('closed', () => {
    mainWindow = null;
  });

  // Load the SvelteKit build output via local server to avoid file:// 404s
  const targetUrl = `http://127.0.0.1:${STATIC_PORT}`;
  void win.loadURL(targetUrl);

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
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
});

app.whenReady().then(async () => {
  await startStaticServer();
  ipcMain.handle('cards:get', async () => {
    const cards = await readCards();
    return cards;
  });

  ipcMain.handle('cards:add', async (_ev, data: { title: string; prompt: string; topic: string }) => {
    if (!data || typeof data.title !== 'string' || typeof data.prompt !== 'string') {
      throw new Error('Invalid input');
    }
    const cards = await readCards();
    const newCard: RawCard = {
      id: randomUUID(),
      title: data.title,
      prompt: data.prompt,
      topic: data.topic || '',
      status: 'todo',
      createdAt: new Date().toISOString()
    };
    cards.unshift(newCard);
    await writeCards(cards);
    return newCard;
  });

  ipcMain.handle('cards:toggle', async (_ev, args: { id: string; status: Status }) => {
    const { id, status } = args;
    const cards = await readCards();
    const idx = cards.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error('Card not found');
    cards[idx].status = status;
    await writeCards(cards);
    return cards[idx];
  });

  ipcMain.handle('cards:run', async (_ev, prompt: string) => {
    if (typeof prompt !== 'string') throw new Error('Invalid prompt');
    const url = buildChatGPTUrl(prompt);
    if (!url.startsWith('https://chat.openai.com/')) throw new Error('Blocked external URL');
    await shell.openExternal(url);
    return true;
  });

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', () => {
  if (staticServer) {
    staticServer.close();
    staticServer = null;
  }
});