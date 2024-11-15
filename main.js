// main.js
const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200, // Increased width for better view
    height: 800, // Increased height for better view
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.loadFile('index.html');
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

// IPC handlers

ipcMain.on('add-drug', (event, drugData) => {
  const drugFile = path.join(
    app.getPath('userData'),
    'data',
    `${drugData.name}.drug`
  );
  fs.writeFileSync(drugFile, JSON.stringify(drugData, null, 2));
});

ipcMain.handle('get-drugs', () => {
  const dataPath = path.join(app.getPath('userData'), 'data');
  const files = fs.readdirSync(dataPath);
  const drugs = files
    .filter((file) => file.endsWith('.drug') && !file.endsWith('_protocol.drug'))
    .map((file) => JSON.parse(fs.readFileSync(path.join(dataPath, file))));
  return drugs;
});

ipcMain.on('add-protocol', (event, protocolData) => {
  const protocolFile = path.join(
    app.getPath('userData'),
    'data',
    `${protocolData.protocolTitle}_protocol.drug`
  );
  fs.writeFileSync(protocolFile, JSON.stringify(protocolData, null, 2));
});

ipcMain.handle('get-protocols', () => {
  const dataPath = path.join(app.getPath('userData'), 'data');
  const files = fs.readdirSync(dataPath);
  const protocols = files
    .filter((file) => file.endsWith('_protocol.drug'))
    .map((file) => JSON.parse(fs.readFileSync(path.join(dataPath, file))));
  return protocols;
});

// Export protocol handler
ipcMain.on('export-protocol', (event, protocolDataStr) => {
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
