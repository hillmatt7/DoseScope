// main.js
const { app, BrowserWindow, ipcMain, dialog, Menu } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

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
  createWindow();

  const dataPath = path.join(app.getPath('userData'), 'local_library');
  if (!fs.existsSync(dataPath)) {
    fs.mkdirSync(dataPath);
  }

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// Menu template for File > New
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
];

// IPC handlers

ipcMain.on('add-compound', (event, compoundData) => {
  
  // Check if local_library directory exists

const fs = require('fs');
const path = require('path');

// Define the directory name
const directory = path.join(__dirname, 'local_library');

// Check if the directory exists
if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
    console.log(`Directory '${directory}' created.`);
} else {
    console.log(`Directory '${directory}' already exists.`);
}

  const compoundFile = path.join(
    app.getPath('userData'),
    'local_library',
    `${compoundData.name}.drug`
  );
  const drugContent = Object.entries(compoundData)
    .map(([key, value]) => `${key} = ${value}`)
    .join('\n');
  fs.writeFileSync(compoundFile, `[Drug]\n${drugContent}\n`);
});

ipcMain.handle('get-compounds', () => {
  const dataPath = path.join(app.getPath('userData'), 'local_library');
  const files = fs.readdirSync(dataPath);
  const compounds = files
    .filter((file) => file.endsWith('.drug'))
    .map((file) => parseDrugFile(path.join(dataPath, file)));
  return compounds;
});

function parseDrugFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const drugData = {};
  content.split('\n').forEach((line) => {
    if (line.startsWith('[') && line.endsWith(']')) return; // Skip section headers
    const [key, value] = line.split('=').map((part) => part.trim());
    if (value.startsWith('"') && value.endsWith('"')) {
      drugData[key] = value.slice(1, -1);
    } else if (!isNaN(value)) {
      drugData[key] = parseFloat(value);
    } else {
      drugData[key] = value;
    }
  });
  return drugData;
}