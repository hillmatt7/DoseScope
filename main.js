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

  const dataPath = path.join(app.getPath('userData'), 'data');
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
  const compoundFile = path.join(
    app.getPath('userData'),
    'data',
    `${compoundData.name}.drug`
  );
  fs.writeFileSync(compoundFile, JSON.stringify(compoundData, null, 2));
});

ipcMain.handle('get-compounds', () => {
  const dataPath = path.join(app.getPath('userData'), 'data');
  const files = fs.readdirSync(dataPath);
  const compounds = files
    .filter((file) => file.endsWith('.drug'))
    .map((file) => JSON.parse(fs.readFileSync(path.join(dataPath, file))));
  return compounds;
});

// Handle saving protocols (if needed)
ipcMain.on('save-protocol', (event, protocolDataStr) => {
  dialog
    .showSaveDialog({
      title: 'Save Protocol',
      defaultPath: 'protocol.json',
      filters: [{ name: 'JSON Files', extensions: ['json'] }],
    })
    .then(({ filePath }) => {
      if (filePath) {
        fs.writeFileSync(filePath, protocolDataStr);
      }
    });
});
