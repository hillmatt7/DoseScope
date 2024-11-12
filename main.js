const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true, // Enable context isolation
      nodeIntegration: false, // Disable node integration
    },
  });

  mainWindow.loadFile('index.html');
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

const dataPath = path.join(app.getPath('userData'), 'data');
if (!fs.existsSync(dataPath)) {
  fs.mkdirSync(dataPath);
}

ipcMain.on('add-drug', (event, drugData) => {
  const drugFile = path.join(dataPath, `${drugData.name}.drug`);
  fs.writeFileSync(drugFile, JSON.stringify(drugData, null, 2));
});

ipcMain.handle('get-drugs', () => {
  const files = fs.readdirSync(dataPath);
  const drugs = files
    .filter((file) => file.endsWith('.drug') && !file.endsWith('_protocol.drug'))
    .map((file) => JSON.parse(fs.readFileSync(path.join(dataPath, file))));
  return drugs;
});

ipcMain.on('add-protocol', (event, protocolData) => {
  const protocolFile = path.join(dataPath, `${protocolData.drugName}_protocol.drug`);
  fs.writeFileSync(protocolFile, JSON.stringify(protocolData, null, 2));
});

ipcMain.handle('get-protocols', () => {
  const files = fs.readdirSync(dataPath);
  const protocols = files
    .filter((file) => file.endsWith('_protocol.drug'))
    .map((file) => JSON.parse(fs.readFileSync(path.join(dataPath, file))));
  return protocols;
});
