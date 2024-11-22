// main.js

const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

function ensureLocalLibraryExists() {
  const dataPath = path.join(app.getPath('userData'), 'local_library');
  if (!fs.existsSync(dataPath)) {
    fs.mkdirSync(dataPath, { recursive: true });
    console.log(`Directory '${dataPath}' created.`);
  } else {
    console.log(`Directory '${dataPath}' already exists.`);
  }
  return dataPath;
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.loadFile('index.html');

  // Build the menu
  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);
}

app.whenReady().then(() => {
  ensureLocalLibraryExists();
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// Menu template for File > New and View > Adjust Graph Scales
const menuTemplate = [
  {
    label: 'File',
    submenu: [
      {
        label: 'New Protocol',
        accelerator: 'CmdOrCtrl+N',
        click() {
          mainWindow.webContents.send('new-protocol');
        },
      },
      { role: 'quit' },
    ],
  },
  {
    label: 'View',
    submenu: [
      {
        label: 'Adjust Graph Scales',
        click() {
          mainWindow.webContents.send('open-scale-adjustment');
        },
      },
    ],
  },
];

// IPC handlers

ipcMain.handle('add-compound', async (event, compoundData) => {
  try {
    const directory = ensureLocalLibraryExists();
    const compoundFile = path.join(directory, `${compoundData.name}.cmpd`);

    // Ensure numeric fields are properly formatted
    const numericFields = ['molecularWeight', 'halfLife', 'Cmax', 'Tmax', 'bioavailability'];
    numericFields.forEach((field) => {
      if (compoundData[field] === '') {
        compoundData[field] = '0';
      }
    });

    const compoundContent = `[Compound]\n${Object.entries(compoundData)
      .map(([key, value]) => `${key} = ${value}`)
      .join('\n')}\n`;

    fs.writeFileSync(compoundFile, compoundContent);
    console.log(`Compound saved to ${compoundFile}`);

    return { success: true };
  } catch (error) {
    console.error('Error saving compound:', error);
    throw error;
  }
});

ipcMain.handle('get-compounds', async () => {
  try {
    const directory = ensureLocalLibraryExists();
    const files = fs.readdirSync(directory);
    const compounds = files
      .filter((file) => file.endsWith('.cmpd'))
      .map((file) => parseCompoundFile(path.join(directory, file)));
    console.log(`Compounds loaded from ${directory}`);
    return compounds;
  } catch (error) {
    console.error('Error reading compounds:', error);
    throw error;
  }
});

function parseCompoundFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const compoundData = {};
  content.split('\n').forEach((line) => {
    if (line.startsWith('[') && line.endsWith(']')) return; // Skip section headers
    if (line.trim() === '') return; // Skip empty lines
    const [key, value] = line.split('=').map((part) => part.trim());
    if (!key || value === undefined) return;

    // Attempt to parse value as number
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      compoundData[key] = numValue;
    } else {
      // Remove surrounding quotes if present
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        compoundData[key] = value.slice(1, -1);
      } else {
        compoundData[key] = value;
      }
    }
  });
  return compoundData;
}
