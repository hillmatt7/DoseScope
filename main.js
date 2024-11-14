// main.js
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true, // Ensure context isolation is enabled for security
      nodeIntegration: false, // Ensure Node integration is disabled for security
    },
  });

  mainWindow.loadFile('index.html');
}

app.whenReady().then(() => {
  createWindow();

  // Initialize the dataPath directory inside app.whenReady()
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
  const drugFile = path.join(app.getPath('userData'), 'data', `${drugData.name}.drug`);
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
  const protocolFile = path.join(app.getPath('userData'), 'data', `${protocolData.drugName}_protocol.drug`);
  fs.writeFileSync(protocolFile, JSON.stringify(protocolData, null, 2));
});

ipcMain.handle('get-protocols', () => {
  const dataPath = path.join(app.getPath('userData'), 'data');
  const files = fs.readdirSync(dataPath);
  const protocols = files
    .filter((file) => file.endsWith('_protocol.drug'))
    .map((file) => JSON.parse(fs.readFileSync(path.join(dataPath, file))));
  return protocols;


ipcMain.on('export-protocol', (event, protocolDataStr) => {
  const { dialog } = require('electron');
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

});
