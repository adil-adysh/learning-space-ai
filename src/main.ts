import { app, BrowserWindow, ipcMain, shell } from 'electron';
import * as path from 'path';
import { randomUUID } from 'crypto';
import { RawCard, Status } from './types';
import { readCardsFrom, writeCardsTo } from './storage';
import { buildChatGPTUrl } from './util';

const FILE_NAME = 'cards.json';

let mainWindow: BrowserWindow | null = null;

function getDataPath() {
  return path.join(app.getPath('userData'), FILE_NAME);
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
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow = win;
  win.on('closed', () => {
    mainWindow = null;
  });

  // Load the HTML from the source dir so dev build (tsc) can run without bundling HTML
  win.loadFile(path.join(__dirname, '..', 'src', 'index.html'));

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

app.whenReady().then(() => {
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